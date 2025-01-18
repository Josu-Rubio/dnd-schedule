// types/passport-discord.d.ts
declare module 'passport-discord' {
    import { Strategy } from 'passport';
  
    export interface DiscordProfile {
      id: string;
      username: string;
      discriminator: string;
      avatar: string;
      email?: string;
      locale: string;
      // You can add more fields as per your requirements
    }
  
    export class Strategy extends Strategy {
      constructor(options: any, verify: any);
    }
  }
  