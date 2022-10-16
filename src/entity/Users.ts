import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userId: string;

  @Column()
  name: string;

  @Column()
  image: string;

  // @ManyToOne(() => Channel, (channel) => channel.users, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn({ name: 'channels', referencedColumnName: 'channelId' })
  // channel: Channel;
}
