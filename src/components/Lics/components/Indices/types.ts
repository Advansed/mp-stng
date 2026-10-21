// src/components/Lics/components/Indices/types.ts

import { LicCounter } from "../../../../Store/licsStore";
import { LicsItem } from "../types";
import { ReadingResult } from '../../../../utils/meterReadings';


export interface CounterProps {
  info:         LicCounter;
  item:         LicsItem;
  setPage:      (page: number) => void;
  setIndice:    ( counters: LicCounter[]) => Promise<ReadingResult>
}

export interface IndicesProps {
  item:         LicsItem;
  setPage:      (page: number) => void;
  setIndice:    ( counters: LicCounter[]) => Promise<ReadingResult>
}


export interface LoginData {
  monthes:      number;
  borders: {
    from:       number;
    to:         number;
  };
}
