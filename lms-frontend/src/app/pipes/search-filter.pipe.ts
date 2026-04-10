import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    const search = searchText.toLowerCase();
    return items.filter(it => {
      if (typeof it === 'string') {
        return it.toLowerCase().includes(search);
      } else if (typeof it === 'number') {
        return it.toString().includes(search);
      }
      return false;
    });
  }
}
