import type { TService } from '../Store/serviceStore';
import type { PageData } from '../components/DataEditor/types';
/** Read current unsaved form values, not the original server template. */
export function currentCheckService(service: TService | null, sections: PageData): TService | null {
  if (!service || !sections.length) return service;
  const fields=sections.flatMap(section=>section.data);
  return {...service,chapters:service.chapters.map(chapter=>({...chapter,
    data:(chapter.data || []).map(field=>{const live=fields.find(f=>f.name===field.name);return live?{...field,value:live.data}:field}),
    files:(chapter.files || []).map(field=>{const live=fields.find(f=>f.name===field.name);return live?{...field,data:live.data as typeof field.data}:field}),
  }))};
}
