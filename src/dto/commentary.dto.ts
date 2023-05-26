export class CommentaryDto {
  author: {
    readonly userId: number;
    readonly name: string;
  };
  readonly text: string;
  readonly essenceTable: string;
  readonly essenceId: number;
}
