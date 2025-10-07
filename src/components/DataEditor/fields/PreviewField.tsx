// src/components/DataEditor/fields/ImageField.tsx
import React, { useEffect, useState } from "react";
import styles from './ImageField.module.css';
import { IonLoading } from "@ionic/react";
import { useToast } from "../../Toast";
import { PDFDocModal } from "../../Files/PDFDocModal";
import { PDFDoc, PDFDocument } from "../../Files";

// TODO: Добавить функцию toTIFF позже

interface ImageFieldProps {

  getPreview:     () => Promise<any>

}

export const PreviewField: React.FC<ImageFieldProps> = ({ getPreview }) => {
  const [ info, setInfo ] = useState<string>()
  const [ load, setLoad ] = useState(false)

  const toast = useToast()

  const Load = async() => {
    setLoad( true )
    
    const res = await getPreview()

    if(!res.error) setInfo(res.data.dataUrl)
    else toast.error( res.message )
    
    setLoad( false )
  }

  useEffect( () => {
    Load()
  },[])

  return (
    <>
      <IonLoading isOpen = { load } message = { "Подождите..." }/>
      <div className="">
            {info && (
              <div className="">
                {/* <img 
                  src       = {  info } 
                  alt       = { "Просмотр" }
                  className = { styles.imagePreview }
                /> */}
                  <PDFDocument  url = { info } name  = { "Просмотр" } title = { "Просмотр" }/>
              </div>
            )}
      </div>
    </>
  );
  
};