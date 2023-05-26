import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity(`comments`)
export class Commentary {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '1', description: 'Идентификатор автора' })
  @Column({ type: 'numeric' })
  userId: number;

  @ApiProperty({ example: 'любой текст', description: 'Текст комментария' })
  @Column({ type: 'text', default: '' })
  text: string;

  @ApiProperty({
    example: 'movies',
    description: 'Название сущности, к которой относится комментарий',
  })
  @Column({ type: 'varchar', length: 255 })
  essenceTable: string;

  @ApiProperty({
    example: '1',
    description: 'Идентификатор элемента, к которому относится комментарий',
  })
  @Column({ type: 'numeric' })
  essenceId: number;

  @ApiProperty({
    example: '2019-04-23T18:25:43.511Z',
    description: 'Дата создания комментария',
  })
  @CreateDateColumn({
    transformer: {
      to(value) {
        return value;
      },
      from(value) {
        return +value;
      },
    },
  })
  date: number;


/*  @UpdateDateColumn()
  updated_at: Date;*/
}
