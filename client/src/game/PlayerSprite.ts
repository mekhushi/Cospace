import * as PIXI from 'pixi.js';

export class PlayerSprite extends PIXI.Container {
  private avatarSprite: PIXI.Sprite | null = null;
  private glowRing: PIXI.Graphics | null = null;
  private speechBubble: PIXI.Container | null = null;
  private speechTimeout: any = null;
  private nameTag: PIXI.Text;
  private avatarUrl: string;
  
  public targetX: number = 0;
  public targetY: number = 0;

  constructor(username: string, avatarUrl: string, x: number = 0, y: number = 0) {
    super();
    this.avatarUrl = avatarUrl;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;

    // Name Tag
    const style = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '900',
      fill: '#ffffff',
      stroke: { color: '#000000', width: 2 },
    });
    this.nameTag = new PIXI.Text({ text: username.toLowerCase(), style });
    this.nameTag.anchor.set(0.5, 1);
    this.nameTag.y = -55;
    this.addChild(this.nameTag);

    this.initAvatar();
  }

  private async initAvatar() {
    // 1. Draw fallback immediately so player is never invisible
    this.drawFallbackAvatar(this.avatarUrl.startsWith('#') ? this.avatarUrl : '#444444');

    try {
      if (this.avatarUrl.startsWith('#')) return;

      const texture = await PIXI.Assets.load(this.avatarUrl);
      this.avatarSprite = new PIXI.Sprite(texture);
      this.avatarSprite.anchor.set(0.5, 0.5);
      
      const targetSize = 80;
      this.avatarSprite.width = targetSize;
      this.avatarSprite.height = targetSize;
      
      // Add on top of fallback
      this.addChildAt(this.avatarSprite, 1);
    } catch (e) {
      console.error('Failed to load avatar:', e);
    }
  }

  private drawFallbackAvatar(color: string) {
    const fallback = new PIXI.Graphics();
    fallback.fill({ color: color });
    fallback.circle(0, 0, 40);
    fallback.stroke({ color: 0xffffff, width: 3 });
    this.addChildAt(fallback, 0);
  }

  public setAsLocalPlayer() {
    // Add a glowing ring under the local player
    this.glowRing = new PIXI.Graphics();
    this.glowRing.setStrokeStyle({ width: 4, color: 0x10b981, alpha: 0.6 });
    this.glowRing.circle(0, 0, 50);
    this.glowRing.stroke();
    
    this.addChildAt(this.glowRing, 0);
  }

  public updatePosition(x: number, y: number, lerp: boolean = true) {
    if (lerp) {
      this.targetX = x;
      this.targetY = y;
    } else {
      this.x = x;
      this.y = y;
      this.targetX = x;
      this.targetY = y;
    }
  }

  public tick(delta: number) {
    // Safety check for NaN
    if (isNaN(this.targetX) || isNaN(this.targetY)) return;

    // Smooth LERP (frame-rate independent)
    const lerpFactor = 0.15 * delta;
    this.x += (this.targetX - this.x) * Math.min(lerpFactor, 1);
    this.y += (this.targetY - this.y) * Math.min(lerpFactor, 1);
    
    // Gentle floating animation
    if (this.avatarSprite) {
      this.avatarSprite.y = Math.sin(Date.now() / 200) * 2;
    }

    // Animate local player ring
    if (this.glowRing) {
      this.glowRing.scale.set(1 + Math.sin(Date.now() / 300) * 0.1);
    }
  }

  public showSpeechBubble(text: string) {
    if (this.speechBubble) {
      this.removeChild(this.speechBubble);
      if (this.speechTimeout) clearTimeout(this.speechTimeout);
    }

    this.speechBubble = new PIXI.Container();
    this.speechBubble.y = -90; // Above name tag

    const style = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#ffffff',
      wordWrap: true,
      wordWrapWidth: 150,
      align: 'center'
    });

    const msgText = new PIXI.Text({ text, style });
    msgText.anchor.set(0.5, 1);

    const padding = 10;
    const bg = new PIXI.Graphics();
    bg.fill({ color: 0x000000, alpha: 0.8 });
    bg.setStrokeStyle({ width: 2, color: 0x3b82f6 });
    bg.roundRect(
      -msgText.width / 2 - padding, 
      -msgText.height - padding, 
      msgText.width + padding * 2, 
      msgText.height + padding * 2, 
      8
    );
    bg.fill();
    bg.stroke();

    // Small triangle at bottom
    bg.poly([-8, 0, 8, 0, 0, 8]);
    bg.fill();

    this.speechBubble.addChild(bg);
    this.speechBubble.addChild(msgText);
    this.addChild(this.speechBubble);

    this.speechTimeout = setTimeout(() => {
      if (this.speechBubble) {
        this.removeChild(this.speechBubble);
        this.speechBubble = null;
      }
    }, 5000);
  }
}
