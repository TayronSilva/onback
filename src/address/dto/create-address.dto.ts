import { ApiProperty } from "@nestjs/swagger"
import { isNotEmpty, IsNotEmpty, isString, IsString } from 'class-validator'

export class CreateAddressDto {
    @ApiProperty({
            example: 'Paulo',
            description: 'user who will receive the order',
        })
        @IsString()
        @IsNotEmpty()
        name: string;
    
        @ApiProperty({
            example: '00000-000',
        })
        @IsString()
        @IsNotEmpty()
        zipCode: string;
    
        @ApiProperty({
            example: '(xx)xxxxxx-xxxx',
        })
        @IsString()
        @IsNotEmpty()
        phone: string;
    
        @ApiProperty({
            example: 'Backpack Street, 123',
        })
        @IsString()
        @IsNotEmpty()
        address: string;

        @ApiProperty({
            example: 'Apartment 202',
        })
        @IsString()
        @IsNotEmpty()
        additional: string;

        @ApiProperty({
            example: 'Close to the market',
        })
        @IsString()
        @IsNotEmpty()
        reference: string;

        @ApiProperty({
            example: 'true or false',
        })
        @IsString()
        @IsNotEmpty()
        isDefault: boolean;

}

