import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  channelId: string;

  // @OneToMany(() => User, (user) => user.userId, {
  //   cascade: true,
  // })
  // users: User[];

  // @OneToMany(() => Restaurant, (restaurant) => restaurant.id, {
  //   cascade: true,
  // })
  // restaurants: Restaurant[];
}
