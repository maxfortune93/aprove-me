export class Assignor {
  constructor(
    public readonly id: string,
    public readonly document: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly name: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
