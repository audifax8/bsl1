import { Query } from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
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

  /*@Get()
  public get(@Query() query: any, @Res() response: Response) {
    Logger.log(query);
    return response.status(HttpStatus.OK).send({
      nombre: 'get',
      query,
    });
  }*/

  @Get()
  public get(@Query() query: any, @Res() response: Response) {
    try {
      if (!query.petId) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: 'petId required',
        });
      }
      const pet = this.pets.find((pet) => pet.id === parseInt(query.petId, 10));
      if (!pet) {
        return response.status(HttpStatus.NOT_FOUND).send({
          error: 'Pet not found',
        });
      }
      return response.status(HttpStatus.OK).send(pet);
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: 'Server error' });
    }
  }
}
