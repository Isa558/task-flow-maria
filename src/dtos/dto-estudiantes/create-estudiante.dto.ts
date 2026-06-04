import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateEstudianteDto {
  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'María',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombre: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'García',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  apellido: string;

  @ApiProperty({
    description: 'Número de cédula del estudiante',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  cedula: string;
}
