import { FieldValidationError, ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');
    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeErrors() {
    return this.errors.map((err) => {
      if (err.type === 'field') {
        const fieldError = err as FieldValidationError;
        return { message: fieldError.msg, field: fieldError.path };
      } else {
        return { message: err.msg };
      }
    });
  }
}
