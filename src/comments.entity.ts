import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity(`comments`)
export class Commentary {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '1', description: 'Идентификатор автора' })
  @Column({ type: 'numeric' })
  authorId: number;

  @ApiProperty({ example: 'любой текст', description: 'текст комментария' })
  @Column({ type: 'text', default: '' })
  text: string;

  @ApiProperty({ example: '1', description: 'количество лайков' })
  @Column({ type: 'numeric', default: 0 })
  likes: number;

  @ApiProperty({
    example: 'movie',
    description: 'название сущности, к которой относится комментарий',
  })
  @Column({ type: 'varchar', length: 255 })
  essenceTable: string;

  @ApiProperty({
    example: '1',
    description: 'id элемента, к которому относится комментарий',
  })
  @Column({ type: 'numeric' })
  essenceId: number;
}
