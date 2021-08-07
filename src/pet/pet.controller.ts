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
  pets: any = [
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
    try {
      //throw new Error();
      Logger.log(body);
      if (!body.name || !body.category) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: 'Invalid request body',
        });
      }

      const category = this.categories.find((cat) => cat.id === body.category);
      Logger.debug(category);
      if (!category) {
        return response.status(HttpStatus.NOT_FOUND).send({
          error: 'Category not found',
        });
      }
      const newPet = {
        name: body.name,
        id: this.pets.length + 1,
        category,
      };
      this.pets.push(newPet);
      return response.status(HttpStatus.CREATED).send(newPet);
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: 'Server error' });
    }
  }
}
