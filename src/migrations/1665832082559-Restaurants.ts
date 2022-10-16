import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Restaurants1665832082559 implements MigrationInterface {
  name = 'Restaurants1665832082559';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'restaurants',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'restaurants',
      new TableForeignKey({
        columnNames: ['id'],
        referencedTableName: 'channels',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const restaurants = await queryRunner.getTable('restaurants');
    const foreignKey = restaurants.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('id') !== -1,
    );
    await queryRunner.dropForeignKey(restaurants, foreignKey);
    await queryRunner.dropTable(restaurants);
  }
}
