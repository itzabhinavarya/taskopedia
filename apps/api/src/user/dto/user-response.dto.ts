import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'New York' })
  @Expose()
  city: string;

  @ApiProperty({ example: '+1234567890' })
  @Expose()
  phone: string;

  @ApiProperty({ example: true })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T14:45:00Z', required: false })
  @Expose()
  updatedAt?: Date;

  // Exclude sensitive fields
  @Exclude()
  password: string;

  @Expose()
  otp: string;

  @Exclude()
  otpExpiry: Date;

  @Exclude()
  isActive: boolean;

  @Exclude()
  isDeleted: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

