import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadingZeros',
  standalone: true
})
export class LeadingZerosPipe implements PipeTransform {

  transform(value: number, length: number = 3): string {
    return value.toString().padStart(length, '0');
  }

}
