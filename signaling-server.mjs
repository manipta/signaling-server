import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.SIGNAL_PORT ? Number(process.env.SIGNAL_PORT) : 8787;
const ROOM_TTL_MS = 10 * 60 * 1000;
const DEFAULT_DURATION_SECONDS = 60;

const prompts = [
  // Food & Drinks
  'Draw a slice of pizza',
  'Draw a melting ice cream cone',
  'Draw a giant hamburger',
  'Draw a donut with sprinkles',
  'Draw a cupcake',
  'Draw a slice of watermelon',
  'Draw a sunny side up egg',
  'Draw a taco',
  'Draw a burrito',
  'Draw a lollipop',
  'Draw a popsicle',
  'Draw a candy cane',
  'Draw a pretzel',
  'Draw a milkshake',
  'Draw a cup of hot coffee',
  'Draw a slice of toast',
  'Draw a slice of cheese',
  'Draw a cherry on top',
  'Draw a juicy apple',
  'Draw a birthday cake with candles',
  'Draw a cookie with chocolate chips',
  'Draw a bowl of noodles',
  'Draw a hot dog',
  'Draw a fried chicken leg',
  'Draw a jar of honey',
  'Draw a bunch of grapes',
  'Draw a banana',
  'Draw a strawberry',
  'Draw a pineapple',
  'Draw a coconut',
  'Draw a mango',
  'Draw an avocado',
  'Draw a piece of sushi',
  'Draw a bowl of soup',
  'Draw a popcorn bucket',
  'Draw a candy bar',
  'Draw a gingerbread man',
  'Draw a stack of pancakes',
  'Draw a waffle',
  'Draw a slice of pie',
  'Draw a cheese pizza',
  'Draw a bag of chips',
  'Draw a carrot',
  'Draw a corn on the cob',
  'Draw a broccoli',
  'Draw an orange',
  'Draw a lemon',
  'Draw a pear',
  'Draw a peach',
  'Draw a coffee mug',
  'Draw a teapot',
  'Draw a glass of juice',
  'Draw a smoothie',
  'Draw a bottle of ketchup',
  'Draw a jar of jam',
  // Animals
  'Draw a cute sleeping cat',
  'Draw a cute puppy',
  'Draw a friendly dinosaur',
  'Draw a buzzing bee',
  'Draw a ladybug',
  'Draw a cute turtle',
  'Draw a friendly whale',
  'Draw a cute owl',
  'Draw a cute bunny',
  'Draw a jellyfish',
  'Draw a goldfish in a bowl',
  'Draw a cute penguin',
  'Draw a caterpillar',
  'Draw a simple butterfly',
  'Draw a snail',
  'Draw a frog on a lily pad',
  'Draw a happy dolphin',
  'Draw a baby chick',
  'Draw a flamingo',
  'Draw a parrot',
  'Draw a koala',
  'Draw a panda bear',
  'Draw a monkey',
  'Draw a giraffe',
  'Draw an elephant',
  'Draw a lion',
  'Draw a zebra',
  'Draw a hippo',
  'Draw a crocodile',
  'Draw a snake',
  'Draw a spider',
  'Draw a scorpion',
  'Draw a seahorse',
  'Draw a starfish',
  'Draw a crab',
  'Draw a lobster',
  'Draw a shark fin',
  'Draw a bat',
  'Draw a mouse',
  'Draw a hamster',
  'Draw a puppy with a bone',
  'Draw a sleeping dog',
  'Draw a bird on a branch',
  'Draw a robin',
  'Draw a duck',
  'Draw a swan',
  'Draw a peacock',
  'Draw a pig',
  'Draw a cow',
  'Draw a sheep',
  'Draw a horse',
  'Draw a donkey',
  'Draw a rooster',
  'Draw a hen with eggs',
  'Draw a dragonfly',
  'Draw an ant',
  'Draw a grasshopper',
  'Draw a worm',
  'Draw a hedgehog',
  'Draw a squirrel',
  'Draw a deer',
  'Draw a fox',
  'Draw a wolf',
  'Draw a bear',
  'Draw a raccoon',
  'Draw a skunk',
  'Draw an octopus',
  // Nature & Weather
  'Draw a palm tree on an island',
  'Draw a colorful rainbow',
  'Draw a fluffy cloud with rain',
  'Draw a smiling sun',
  'Draw a crescent moon and stars',
  'Draw a simple snowflake',
  'Draw a simple pine tree',
  'Draw a falling leaf',
  'Draw a volcano',
  'Draw a potted plant',
  'Draw a mushroom',
  'Draw a cactus in a pot',
  'Draw a simple flower',
  'Draw a sand castle',
  'Draw a campfire',
  'Draw a shooting star',
  'Draw a planet with rings',
  'Draw a mountain with snow',
  'Draw a sunset over the ocean',
  'Draw a tornado',
  'Draw a lightning bolt',
  'Draw a rain cloud',
  'Draw a thunderstorm',
  'Draw a snowstorm',
  'Draw a sunrise',
  'Draw a full moon',
  'Draw a field of flowers',
  'Draw a waterfall',
  'Draw a river',
  'Draw a lake',
  'Draw a pond with lily pads',
  'Draw an ocean wave',
  'Draw a coral reef',
  'Draw a desert with a cactus',
  'Draw a forest',
  'Draw a jungle',
  'Draw a sunflower',
  'Draw a rose',
  'Draw a tulip',
  'Draw a daisy',
  'Draw a four leaf clover',
  'Draw a palm tree',
  'Draw a bamboo',
  'Draw an oak tree',
  'Draw a willow tree',
  'Draw a bush',
  'Draw a pile of leaves',
  'Draw a snowdrift',
  'Draw a puddle',
  'Draw a cave',
  'Draw a cliff',
  'Draw a hill',
  'Draw a valley',
  'Draw an island',
  // Objects & Everyday
  'Draw a pair of sunglasses',
  'Draw a pair of headphones',
  'Draw a skateboard',
  'Draw a magic potion bottle',
  'Draw a pair of scissors',
  'Draw a wrapped gift box',
  'Draw a pair of winter mittens',
  'Draw a ringing alarm clock',
  'Draw a lit candle',
  'Draw a pair of reading glasses',
  'Draw a classic wristwatch',
  'Draw a pair of socks',
  'Draw a simple house key',
  'Draw a lightbulb',
  'Draw a pencil and eraser',
  'Draw a simple padlock',
  'Draw a ringing bell',
  'Draw a classic envelope',
  'Draw a magic 8-ball',
  'Draw a bowtie',
  'Draw a yo-yo',
  'Draw a flashlight',
  'Draw a dripping paintbrush',
  'Draw a megaphone',
  'Draw a pair of dice',
  'Draw a binoculars',
  'Draw a balloon animal',
  'Draw a small umbrella',
  'Draw a simple trophy',
  'Draw a compass',
  'Draw a drum',
  'Draw a bow and arrow',
  'Draw a key and lock',
  'Draw a treasure map',
  'Draw a backpack',
  'Draw a suitcase',
  'Draw a wallet',
  'Draw a handbag',
  'Draw a shopping bag',
  'Draw a baseball cap',
  'Draw a top hat',
  'Draw a wizard hat',
  'Draw a crown with jewels',
  'Draw a tiara',
  'Draw a necktie',
  'Draw a scarf',
  'Draw a pair of boots',
  'Draw a pair of sneakers',
  'Draw a flip flop',
  'Draw a high heel shoe',
  'Draw a belt',
  'Draw a ring',
  'Draw a necklace',
  'Draw a bracelet',
  'Draw a watch',
  'Draw a mirror',
  'Draw a hairbrush',
  'Draw a toothbrush',
  'Draw a bar of soap',
  'Draw a shampoo bottle',
  'Draw a towel',
  'Draw a pillow',
  'Draw a blanket',
  'Draw a lamp',
  'Draw a desk lamp',
  'Draw a chandelier',
  'Draw a picture frame',
  'Draw a vase with flowers',
  'Draw a clock on a wall',
  'Draw a calendar',
  'Draw a sticky note',
  'Draw a notebook',
  'Draw a stapler',
  'Draw a paperclip',
  'Draw a rubber band',
  'Draw a tape dispenser',
  'Draw a ruler',
  'Draw a calculator',
  'Draw a keyboard',
  'Draw a computer mouse',
  'Draw a USB drive',
  'Draw a battery',
  'Draw a plug and socket',
  'Draw a light switch',
  'Draw a remote control',
  'Draw a microphone',
  'Draw a speaker',
  'Draw a radio',
  'Draw a classic telephone',
  'Draw an old fashioned camera',
  'Draw a film camera',
  'Draw a magnifying glass',
  'Draw a telescope pointing at stars',
  'Draw a microscope',
  'Draw a stethoscope',
  'Draw a bandage',
  'Draw a thermometer',
  'Draw a pill bottle',
  'Draw a first aid kit',
  'Draw a fire extinguisher',
  'Draw a hammer',
  'Draw a screwdriver',
  'Draw a wrench',
  'Draw a saw',
  'Draw a paintbrush',
  'Draw a paint roller',
  'Draw a bucket',
  'Draw a broom',
  'Draw a mop',
  'Draw a dustpan',
  'Draw a watering can',
  'Draw a garden hose',
  'Draw a wheelbarrow',
  'Draw a ladder',
  'Draw a toolbox',
  // Vehicles & Transport
  'Draw a fast sports car',
  'Draw a simple bicycle',
  'Draw a simple sailboat',
  'Draw a hot air balloon',
  'Draw a rocket blasting off',
  'Draw a paper airplane',
  'Draw a paper boat',
  'Draw a simple anchor',
  'Draw a school bus',
  'Draw a fire truck',
  'Draw a police car',
  'Draw an ambulance',
  'Draw a taxi',
  'Draw a pickup truck',
  'Draw a motorcycle',
  'Draw a scooter',
  'Draw a helicopter',
  'Draw an airplane',
  'Draw a jet',
  'Draw a submarine',
  'Draw a canoe',
  'Draw a kayak',
  'Draw a speedboat',
  'Draw a cruise ship',
  'Draw a train',
  'Draw a tractor',
  'Draw a bulldozer',
  'Draw a crane',
  'Draw a dump truck',
  'Draw a cement mixer',
  'Draw a hot rod',
  'Draw a race car',
  'Draw a go kart',
  'Draw a wagon',
  'Draw a sled',
  'Draw a surfboard',
  'Draw a snowboard',
  'Draw a ski',
  'Draw a roller skate',
  'Draw an ice skate',
  // Buildings & Places
  'Draw a simple house',
  'Draw a castle',
  'Draw a lighthouse',
  'Draw a windmill',
  'Draw a barn',
  'Draw a tent',
  'Draw an igloo',
  'Draw a treehouse',
  'Draw a skyscraper',
  'Draw a church',
  'Draw a mosque',
  'Draw a temple',
  'Draw a bridge',
  'Draw a ferris wheel',
  'Draw a roller coaster',
  'Draw a pyramid',
  'Draw a log cabin',
  'Draw a doghouse',
  'Draw a birdhouse',
  'Draw a mailbox',
  'Draw a phone booth',
  'Draw a bus stop',
  'Draw a park bench',
  'Draw a swing set',
  'Draw a slide',
  'Draw a fountain',
  'Draw a well',
  'Draw a fence',
  'Draw a gate',
  'Draw a street lamp',
  // Fun & Fantasy
  'Draw a funny robot',
  'Draw an alien spaceship',
  'Draw a pirate flag',
  'Draw a snowman with a top hat',
  'Draw a magical wand',
  'Draw a spooky ghost',
  'Draw a superhero cape',
  'Draw a spooky pumpkin',
  'Draw a magic carpet',
  'Draw a treasure chest',
  'Draw a flying kite',
  'Draw a smiley face',
  'Draw a thumbs up',
  'Draw a peace sign',
  'Draw a heart',
  'Draw a broken heart',
  'Draw a speech bubble',
  'Draw a thought bubble',
  'Draw an exclamation mark',
  'Draw a question mark',
  'Draw a music note',
  'Draw a treble clef',
  'Draw a skull',
  'Draw crossbones',
  'Draw a jolly roger',
  'Draw a shield',
  'Draw a sword',
  'Draw a helmet',
  'Draw a wand with sparkles',
  'Draw a crystal ball',
  'Draw a potion cauldron',
  'Draw a flying broomstick',
  'Draw a witch hat',
  'Draw a vampire teeth',
  'Draw a mummy',
  'Draw a zombie hand',
  'Draw a Frankenstein face',
  'Draw a werewolf face',
  'Draw a jack-o-lantern',
  'Draw a haunted house',
  'Draw a spider web',
  'Draw an angel',
  'Draw a devil face',
  'Draw a ninja star',
  'Draw a samurai sword',
  'Draw a pirate eye patch',
  'Draw a treasure coin',
  'Draw a genie lamp',
  'Draw a magic hat with a rabbit',
  'Draw a playing card',
  'Draw a chess piece',
  'Draw a puzzle piece',
  'Draw a medal',
  'Draw a ribbon',
  'Draw a badge',
  // Sports & Activities
  'Draw a football',
  'Draw a basketball',
  'Draw a tennis racket',
  'Draw a cricket bat',
  'Draw a baseball bat',
  'Draw a golf club',
  'Draw a hockey stick',
  'Draw a badminton racket',
  'Draw a bowling pin',
  'Draw a bowling ball',
  'Draw a dartboard',
  'Draw a boxing glove',
  'Draw a dumbbell',
  'Draw a yoga pose',
  'Draw a swimming pool',
  'Draw a fishing rod',
  'Draw a fishing hook',
  'Draw a tent in the woods',
  'Draw a sleeping bag',
  'Draw a life jacket',
  // Music & Entertainment
  'Draw a guitar',
  'Draw a piano keys',
  'Draw a violin',
  'Draw a trumpet',
  'Draw a saxophone',
  'Draw a flute',
  'Draw a harp',
  'Draw a tambourine',
  'Draw a xylophone',
  'Draw maracas',
  'Draw a movie clapboard',
  'Draw a film reel',
  'Draw a popcorn and soda',
  'Draw a stage with curtains',
  'Draw a spotlight',
  'Draw a disco ball',
  'Draw a DJ turntable',
  'Draw a karaoke mic',
  'Draw a magic show top hat',
  'Draw a puppet',
  // Celebrations & Holidays
  'Draw a Christmas tree',
  'Draw a Christmas stocking',
  'Draw a gift with a bow',
  'Draw a snowglobe',
  'Draw a menorah',
  'Draw a firecracker',
  'Draw a party hat',
  'Draw a party horn',
  'Draw confetti',
  'Draw a balloon bouquet',
  'Draw a wedding cake',
  'Draw a graduation cap',
  'Draw a diploma',
  'Draw a fireworks display',
  'Draw an Easter egg',
  'Draw a heart shaped box',
  'Draw a love letter',
  'Draw a Valentine card',
  'Draw a four leaf clover',
  'Draw a shamrock',
  // Space & Science
  'Draw a planet Earth',
  'Draw the Sun',
  'Draw a comet',
  'Draw a constellation',
  'Draw a UFO',
  'Draw an astronaut helmet',
  'Draw a satellite',
  'Draw a space shuttle',
  'Draw a moon rover',
  'Draw a test tube',
  'Draw an atom',
  'Draw a magnet',
  'Draw a beaker',
  'Draw a globe',
  'Draw a DNA strand',
  // Faces & Expressions
  'Draw a happy face',
  'Draw a sad face',
  'Draw a surprised face',
  'Draw an angry face',
  'Draw a silly face',
  'Draw a winking face',
  'Draw a face with tongue out',
  'Draw a cool face with shades',
  'Draw a crying face',
  'Draw a laughing face',
  // Misc Fun
  'Draw a shining diamond',
  'Draw an open book',
  'Draw a compass rose',
  'Draw a simple clock',
  'Draw a hourglass',
  'Draw a snow angel',
  'Draw a stick figure running',
  'Draw a stick figure dancing',
  'Draw a hand waving',
  'Draw a footprint',
  'Draw a paw print',
  'Draw a yin yang symbol',
  'Draw an infinity sign',
  'Draw a spiral',
  'Draw a zigzag pattern',
  'Draw a checkerboard',
  'Draw a target bullseye',
  'Draw a maze',
  'Draw a crown',
  'Draw a feather',
  'Draw a quill pen',
  'Draw a scroll',
  'Draw a map pin',
  'Draw a stopwatch',
  'Draw a whistle',
  'Draw a flag on a pole'
];

const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end('OK');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });
const rooms = new Map();
const sockets = new Map();

const randomPrompt = () => prompts[Math.floor(Math.random() * prompts.length)];
const randomRoomId = () => Math.random().toString(36).slice(2, 6).toUpperCase();

function send(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(room, message) {
  room.players.forEach((player) => {
    const ws = sockets.get(player.socketId);
    if (ws) send(ws, message);
  });
}

function publicRoom(room) {
  return {
    roomId: room.roomId,
    status: room.status,
    prompt: room.prompt,
    durationSeconds: room.durationSeconds,
    startAt: room.startAt,
    players: room.players.map((player) => ({
      id: player.id,
      submitted: player.submitted,
      connected: Boolean(sockets.get(player.socketId)),
    })),
  };
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  if (room.expireTimeout) clearTimeout(room.expireTimeout);
  if (room.revealTimeout) clearTimeout(room.revealTimeout);
  rooms.delete(roomId);
}

function scheduleRoomExpiry(room) {
  room.expireTimeout = setTimeout(() => {
    broadcast(room, { type: 'room-expired', roomId: room.roomId });
    cleanupRoom(room.roomId);
  }, ROOM_TTL_MS);
}

function startGame(room) {
  room.status = 'active';
  room.startAt = Date.now();

  if (room.expireTimeout) {
    clearTimeout(room.expireTimeout);
    room.expireTimeout = null;
  }

  broadcast(room, {
    type: 'game-started',
    room: publicRoom(room),
  });

  if (typeof room.durationSeconds === 'number') {
    const revealIn = room.durationSeconds * 1000;
    room.revealTimeout = setTimeout(() => {
      room.status = 'revealed';
      broadcast(room, { type: 'force-reveal', reason: 'timer-ended' });
      setTimeout(() => cleanupRoom(room.roomId), 15 * 1000);
    }, revealIn);
  }
}

function handleSubmitted(room, playerId) {
  const player = room.players.find((p) => p.id === playerId);
  if (!player || player.submitted) return;

  player.submitted = true;
  broadcast(room, {
    type: 'room-updated',
    room: publicRoom(room),
  });

  if (room.players.every((p) => p.submitted)) {
    room.status = 'revealed';
    if (room.revealTimeout) clearTimeout(room.revealTimeout);
    broadcast(room, { type: 'force-reveal', reason: 'both-submitted' });
    setTimeout(() => cleanupRoom(room.roomId), 15 * 1000);
  }
}

wss.on('connection', (ws) => {
  const socketId = crypto.randomUUID();
  sockets.set(socketId, ws);

  ws.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: 'error', error: 'Invalid JSON message' });
      return;
    }

    if (message.type === 'ping') {
      send(ws, { type: 'pong' });
      return;
    }

    if (message.type === 'create-room') {
      let roomId = randomRoomId();
      while (rooms.has(roomId)) roomId = randomRoomId();

      const room = {
        roomId,
        status: 'waiting',
        prompt: randomPrompt(),
        durationSeconds: DEFAULT_DURATION_SECONDS,
        startAt: null,
        players: [{ id: 'host', socketId, submitted: false }],
        createdAt: Date.now(),
      };
      rooms.set(roomId, room);
      scheduleRoomExpiry(room);

      send(ws, {
        type: 'room-created',
        playerId: 'host',
        room: publicRoom(room),
      });
      return;
    }

    if (message.type === 'join-room') {
      const room = rooms.get(message.roomId);
      if (!room) {
        send(ws, { type: 'error', error: 'Room not found' });
        return;
      }
      if (room.players.length >= 2) {
        send(ws, { type: 'error', error: 'Room is full' });
        return;
      }
      if (room.status !== 'waiting') {
        send(ws, { type: 'error', error: 'Game already started' });
        return;
      }

      room.players.push({ id: 'guest', socketId, submitted: false });
      send(ws, {
        type: 'room-joined',
        playerId: 'guest',
        room: publicRoom(room),
      });
      broadcast(room, {
        type: 'room-updated',
        room: publicRoom(room),
      });
      return;
    }

    if (message.type === 'start-game') {
      const room = rooms.get(message.roomId);
      if (!room) return;
      if (room.status !== 'waiting') return;
      if (room.players.length !== 2) return;

      const host = room.players.find((p) => p.id === 'host');
      if (!host || host.socketId !== socketId) {
        send(ws, { type: 'error', error: 'Only host can start the game' });
        return;
      }

      if (message.durationSeconds === null) {
        room.durationSeconds = null;
      } else if (typeof message.durationSeconds === 'number') {
        room.durationSeconds = Math.max(5, Math.min(600, message.durationSeconds));
      }
      startGame(room);
      return;
    }

    if (message.type === 'signal') {
      const room = rooms.get(message.roomId);
      if (!room) return;
      const target = room.players.find((p) => p.id === message.to);
      if (!target) return;
      const targetWs = sockets.get(target.socketId);
      if (!targetWs) return;
      send(targetWs, {
        type: 'signal',
        from: message.from,
        signal: message.signal,
      });
      return;
    }

    if (message.type === 'change-prompt') {
      const room = rooms.get(message.roomId);
      if (!room) return;
      if (room.status !== 'waiting') return;
      
      const host = room.players.find((p) => p.id === 'host');
      if (!host || host.socketId !== socketId) return;

      room.prompt = randomPrompt();
      broadcast(room, {
        type: 'room-updated',
        room: publicRoom(room),
      });
      return;
    }

    if (message.type === 'submitted') {
      const room = rooms.get(message.roomId);
      if (!room) return;
      handleSubmitted(room, message.playerId);
      return;
    }
  });

  ws.on('close', () => {
    sockets.delete(socketId);

    for (const [roomId, room] of rooms.entries()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (!player) continue;

      broadcast(room, { type: 'peer-disconnected', playerId: player.id });
      cleanupRoom(roomId);
      break;
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT} (WS + HTTP)`);
});
