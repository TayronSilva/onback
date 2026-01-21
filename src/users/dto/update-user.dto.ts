import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        example: 'New name',
        required: false
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    name?: string;

    @ApiProperty({
        example: 'New password',
        required: false
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    password?: string;
}
