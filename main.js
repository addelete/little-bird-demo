import './style.scss';

const STAGE_WIDTH = 600; // 舞台宽度
const STAGE_HEIGHT = 600; // 舞台高度
const BIRD_SIZE = 20; // 小鸟大小
const BIRD_DEFAULT_X = STAGE_WIDTH / 2 - BIRD_SIZE / 2; // 小鸟默认水平位置
const BIRD_DEFAULT_Y = STAGE_HEIGHT / 2 - BIRD_SIZE / 2; // 小鸟默认垂直位置
const WALL_START_SCALE = 0.3; // 墙壁起始位置比例
const DOOR_WIDTH = 100; // 门宽度
const DOOR_HEIGHT = 100; // 门高度

let WALL_SPEED = Number(
  localStorage.getItem('little-bird-demo:WALL_SPEED') || '1',
); // 墙壁靠近的速度
const FRAME_TIME = 1000 / 60; // 帧时间
const X_SPEED_LESS_SCALE = 0.99; // 水平方向速度衰减系数
const Y_SPEED_GRAVITY = 0.1; // 垂直方向重力加速度
const X_SPEED_DIFF = 1; // 水平方向速度差值
const Y_SPEED_DIFF = 2; // 垂直方向速度差值

class Game {
  stageEl = null;
  birdEl = null;
  wallEl = null;
  doorEl = null;
  scoreEl = null;
  gameOverEl = null;

  birdXMax = 0;
  birdXMin = 0;
  birdYMax = 0;
  birdYMin = 0;

  wallScale = 0;
  birdX = 0;
  birdY = 0;
  birdSpeedX = 0;
  birdSpeedY = 0;

  score = 0;

  constructor() {
    this.init();
    this.bindEvent();
  }

  // 初始化
  init() {
    // 初始化舞台
    this.stageEl = document.querySelector('.stage');
    this.stageEl.style.width = `${STAGE_WIDTH}px`;
    this.stageEl.style.height = `${STAGE_HEIGHT}px`;

    // 初始化小鸟
    this.birdEl = document.querySelector('.bird');
    this.birdEl.style.width = `${BIRD_SIZE}px`;
    this.birdEl.style.height = `${BIRD_SIZE}px`;
    this.birdEl.style.left = `${BIRD_DEFAULT_X}px`;
    this.birdEl.style.top = `${BIRD_DEFAULT_Y}px`;

    this.birdXMax = STAGE_WIDTH / 2 - BIRD_SIZE / 2;
    this.birdXMin = -STAGE_WIDTH / 2 + BIRD_SIZE / 2;
    this.birdYMax = STAGE_HEIGHT / 2 - BIRD_SIZE / 2;
    this.birdYMin = -STAGE_HEIGHT / 2 + BIRD_SIZE / 2;

    // 初始化墙壁
    this.wallEl = document.querySelector('.wall');
    this.wallEl.style.width = `${STAGE_WIDTH}px`;
    this.wallEl.style.height = `${STAGE_HEIGHT}px`;

    // 初始化门
    this.doorEl = document.querySelector('.door');
    this.doorEl.style.width = `${DOOR_WIDTH}px`;
    this.doorEl.style.height = `${DOOR_HEIGHT}px`;

    this.scoreEl = document.querySelector('.score');
    this.gameOverEl = document.querySelector('.gameOver');
  }

  // 绑定事件
  bindEvent() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.fly(true);
      }
      if (e.key === 'ArrowRight') {
        this.fly(false);
      }
      if (e.key === 'Enter') {
        this.start();
      }
    });
  }

  // 随机门位置
  randomDoor() {
    const doorX = Math.random() * (STAGE_WIDTH - DOOR_WIDTH);
    const doorY = Math.random() * (STAGE_HEIGHT - DOOR_HEIGHT);
    this.doorEl.style.left = `${doorX}px`;
    this.doorEl.style.top = `${doorY}px`;
  }

  // 小鸟飞
  fly(isLeft) {
    this.birdSpeedY = -Y_SPEED_DIFF;
    this.birdSpeedX += isLeft ? -X_SPEED_DIFF : X_SPEED_DIFF;
  }

  // 播放帧
  start() {
    this.gameOverEl.style.visibility = 'hidden';
    this.scoreEl.style.visibility = 'visible';
    this.score = 0;
    // 初始化墙壁和门
    this.wallScale = WALL_START_SCALE;
    this.randomDoor();

    this.frameInterval = setInterval(() => {
      console.log(1);
      // 计算帧状态
      this.calcFrame();
      // 渲染帧
      this.renderFrame();
    }, FRAME_TIME);
  }

  // 计算帧状态
  calcFrame() {
    this.wallScale = this.wallScale + WALL_SPEED * 0.002;
    this.birdSpeedX *= X_SPEED_LESS_SCALE;
    this.birdSpeedY += Y_SPEED_GRAVITY;

    if (this.wallScale >= 1) {
      // 算出小鸟和门的坐标，小鸟的初始位置是在舞台中心，所以需要加上舞台宽高的一半
      const birdX1 = this.birdX - BIRD_SIZE / 2 + STAGE_WIDTH / 2;
      const birdX2 = this.birdX + BIRD_SIZE / 2 + STAGE_WIDTH / 2;
      const birdY1 = this.birdY - BIRD_SIZE / 2 + STAGE_WIDTH / 2;
      const birdY2 = this.birdY + BIRD_SIZE / 2 + STAGE_WIDTH / 2;
      const doorX1 = parseFloat(this.doorEl.style.left);
      const doorX2 = doorX1 + DOOR_WIDTH;
      const doorY1 = parseFloat(this.doorEl.style.top);
      const doorY2 = doorY1 + DOOR_HEIGHT;
      // 判断是否通过门
      const isThroughDoor =
        birdX1 > doorX1 &&
        birdX2 < doorX2 &&
        birdY1 > doorY1 &&
        birdY2 < doorY2;
      if (isThroughDoor) {
        this.score++;
        this.wallScale = WALL_START_SCALE; // 重置墙壁
        this.randomDoor(); // 生成门
      } else {
        this.gameOver();
      }
    }

    this.birdX = Math.min(
      Math.max(this.birdX + this.birdSpeedX, this.birdXMin),
      this.birdXMax,
    );

    this.birdY = Math.min(
      Math.max(this.birdY + this.birdSpeedY, this.birdYMin),
      this.birdYMax,
    );
  }

  // 渲染帧
  renderFrame() {
    this.wallEl.style.transform = `scale(${this.wallScale})`;
    this.birdEl.style.transform = `translate(${this.birdX}px, ${this.birdY}px)`;
    this.scoreEl.textContent = this.score.toString();
  }

  // 游戏结束
  gameOver() {
    clearInterval(this.frameInterval);
    this.gameOverEl.textContent = `游戏结束! 得分${this.score}`;
    this.gameOverEl.style.visibility = 'visible';
    this.scoreEl.style.visibility = 'hidden';
  }
}

const initGame = () => {
  const wallSpeedControlEl = document.getElementById('wallSpeedControl');
  const wallSpeedValueEl = document.querySelector('.wallSpeedValue');
  console.log(WALL_SPEED);
  wallSpeedControlEl.value = WALL_SPEED;
  wallSpeedValueEl.textContent = WALL_SPEED;

  wallSpeedControlEl.addEventListener('change', (e) => {
    WALL_SPEED = e.target.value;
    localStorage.setItem('little-bird-demo:WALL_SPEED', WALL_SPEED);
    wallSpeedValueEl.textContent = WALL_SPEED.toString();
    e.target.blur();
  });

  new Game();
};

initGame();