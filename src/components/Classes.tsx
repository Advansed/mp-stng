import React, { useState } from "react";
import { MaskitoOptions } from '@maskito/core';
import { useMaskito } from '@maskito/react';
import { IonInput } from "@ionic/react";




export function Maskito(props:{ value, onIonInput, mask, placeholder  }) {
  
    const phoneMaskOptions: MaskitoOptions = {
      mask:  props.mask //['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
    };
    const phoneMask = useMaskito({ options: phoneMaskOptions });
  
    //If you need to set an initial value, you can use maskitoTransform to ensure the value is valid
    const [myPhoneNumber, setMyPhoneNumber] = useState("");
  
    return (
        <IonInput
            ref={async (phoneInput) => {
              if (phoneInput) {
                const input = await phoneInput.getInputElement();
                phoneMask(input)
              }
            }}
            value={ props.value }
            onIonInput={(e) => {
                props.onIonInput(e)
            }}
            placeholder =  { props.placeholder } //"+7 (xxx) xxx-xxxx"
        />

    );
}
