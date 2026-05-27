let player: Sprite = null
let bombSprite: Sprite = null
let defusalKitSprite: Sprite = null
let level = 1
let defusalKitPickedUp = false
let hasBombExploded = false
let isBombDefused = false
let timeLeft = 180

namespace SpriteKind {
    export const NewType = SpriteKind.create()
    export const Luggage = SpriteKind.create()
    export const Bomb = SpriteKind.create()
    export const DefusalKit = SpriteKind.create()
}

function setUpPlayer() {
    player = sprites.create(assets.image`player`, SpriteKind.Player)
    controller.moveSprite(player, 50, 0)
    scene.cameraFollowSprite(player)
    player.setStayInScreen(true)
    jump(player)
    switch (level) {
        case 1:
            player.setPosition(10, 160)
            break
    }
}

function setUpLuggage() {
    let luggageSpawns = tiles.getTilesByType(assets.tile`luggage-tile`)

    luggageSpawns.forEach((location) => {
        let luggageSprite = sprites.create(assets.image`luggage`, SpriteKind.Luggage)
        luggageSprite.setPosition(location.x, location.y)

        tiles.setTileAt(location, assets.tile`transparency16`)
    })
}

function setUpTilemap() {
    switch (level) {
        case 0:
            tiles.setCurrentTilemap(tilemap`test_level`)
            scene.setBackgroundColor(13)
        case 1:
            tiles.setCurrentTilemap(tilemap`level1_cargo_hold`)
            scene.setBackgroundColor(13)
            break
        default:
            game.gameOver(true)
    }
}

function setUpBombSprites() {
    let bombSpawnLocation = tiles.getTilesByType(assets.tile`bomb_tile`)[0]
    let defusalKitSpawnLocation = tiles.getTilesByType(assets.tile`defusal_kit_tile`)[0]

    if (bombSpawnLocation == null || defusalKitSpawnLocation == null) { return }

    bombSprite = sprites.create(assets.image`bomb`, SpriteKind.Bomb)
    bombSprite.setPosition(bombSpawnLocation.x, bombSpawnLocation.y)

    defusalKitSprite = sprites.create(assets.image`defusal_kit`, SpriteKind.DefusalKit)
    defusalKitSprite.setPosition(defusalKitSpawnLocation.x, defusalKitSpawnLocation.y)

    tiles.setTileAt(bombSpawnLocation, assets.tile`transparency16`)
    tiles.setTileAt(defusalKitSpawnLocation, assets.tile`transparency16`)
}

function startGame() {
    setUpTilemap()
    setUpLuggage()
    setUpBombSprites()
    setUpPlayer()
}

function jump(sprite: Sprite, j?: number, g?: number ) {
    const grav =  g || 220
    const jump_const = j || -100
    sprite.ay = jump_const
    sprite.vy = jump_const
    while (sprite.ay < grav) {
        sprite.ay += Math.abs(sprite.vy)
    }
    sprite.ay = grav
}

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (player.isHittingTile(CollisionDirection.Bottom) && !hasBombExploded) {
        jump(player)
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (player.isHittingTile(CollisionDirection.Bottom) && !hasBombExploded) {
        jump(player)
    }
})

startGame()

scene.onHitWall(SpriteKind.Luggage, function (sprite, location) {
    sprite.vx = 0
    sprite.vy = 0
})

scene.onOverlapTile(SpriteKind.Player, assets.tile`door`, function(sprite: Sprite, location: tiles.Location) {
    sprites.destroy(player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Luggage)

    level++
    startGame()
}) 

sprites.onOverlap(SpriteKind.Player, SpriteKind.Luggage, function (sprite: Sprite, otherSprite: Sprite) {

    if (sprite.vx > 0 && !otherSprite.isHittingTile(CollisionDirection.Right)) {
        otherSprite.x += 1
        sprite.x -= 1
    }
    else if (otherSprite.isHittingTile(CollisionDirection.Right)) {
        sprite.x -= 3
    }

    if (sprite.vx < 0 && !otherSprite.isHittingTile(CollisionDirection.Left)) {
        otherSprite.x -= 1
        sprite.x += 1
    }
    else if (otherSprite.isHittingTile(CollisionDirection.Right)) {
        sprite.x += 3
    }

    let playerBottom = sprite.bottom
    let luggageTop = otherSprite.top

    if (sprite.vy > 0 && !controller.A.isPressed() && !controller.up.isPressed()) {
        sprite.bottom = luggageTop
        sprite.vy = 0
    } 
    else if (controller.A.isPressed() || controller.up.isPressed() && !hasBombExploded) {
        jump(player)
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.DefusalKit, function (sprite: Sprite, otherSprite: Sprite) {
    defusalKitPickedUp = true

    sprites.destroy(otherSprite)

    game.splash('You got the defusal kit!!')
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Bomb, function (sprite: Sprite, otherSprite: Sprite) {
    if (defusalKitPickedUp) {
        isBombDefused = true

        sprites.destroy(otherSprite)

        game.splash('You defused the bomb!!')
    }
    else {
        player.x -= 5
        game.splash('You need a defusal kit\nto defuse this bomb...')
    }
})

game.onUpdateInterval(1000, function() {
    if (!isBombDefused) {
        timeLeft--
    }

    if (timeLeft <= 0 && !hasBombExploded) {
        hasBombExploded = true

        controller.moveSprite(player, 0, 0)
        player.vx = 0
        player.vy = 0
        player.ay = 0

        scene.cameraShake(10, 5000)
        extraEffects.createSpreadEffectAt(extraEffects.createFullPresetsSpreadEffectData(ExtraEffectPresetColor.Fire, ExtraEffectPresetShape.Spark), player.x, player.y, 5000, 500, 200)

        timeLeft = 5
    }
    else if (timeLeft <= 0 && hasBombExploded) {
        game.gameOver(false)
    }
})