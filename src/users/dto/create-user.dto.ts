import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, isEmail, isNotEmpty, IsNotEmpty, isString, IsString } from 'class-validator'

export class CreateUserDto {
    @ApiProperty({
        example: '123.456.789-00',
        description: 'CPF user',
    })
    @IsString()
    @IsNotEmpty()
    cpf: string;

    @ApiProperty({
        example: 'João Silva',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'user@example.com',
    })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'password123',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}

