import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

enum PetCategory {
  DOG = 'dog',
  CAT = 'cat',
}

@Controller('pet')
export class PetController {
  /* simula una bd relacional */

  /* Entidad pets */
  pets = [
    {
      id: 1,
      name: 'Kira',
      /* en este caso category es una clave foránea a la entidad categoria */
      category: PetCategory.DOG,
    },
    {
      id: 2,
      name: 'Maison Mount',
      category: PetCategory.CAT,
    },
  ];

  /* Entidad categorias */
  categories = [
    {
      id: 1,
      name: PetCategory.DOG,
    },
    {
      id: 2,
      name: PetCategory.CAT,
    },
  ];

  /* esto simula una bd no relacional, como Mongo */
  noRelationalPets = [
    {
      id: 1,
      name: 'Kira',
      category: {
        id: 1,
        name: PetCategory.DOG,
      },
    },
    {
      id: 2,
      name: 'Maison Mount',
      category: {
        id: 2,
        name: 'Maison Mount',
        category: PetCategory.CAT,
      },
    },
  ];

  @Post()
  public post(@Body() body: any, @Res() response: Response) {
    Logger.log(body);
    if (!body.name) {
      return response.status(HttpStatus.BAD_REQUEST).send({
        error: 'name is required',
      });
    }
    return response.status(HttpStatus.CREATED).send();
  }
}
