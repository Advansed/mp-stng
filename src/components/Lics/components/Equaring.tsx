import React, { useEffect, useRef, useState } from "react";
import { IonLoading } from "@ionic/react";
import "./Equaring.css";

declare global {
  interface Window {
    PaymentForm: any;
  }
}

type EquaringProps = {
  item: any;
  setPage: (page: number) => void;
  equairing: (order: any) => Promise<any>;
};

function addScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    // Проверяем, не подключен ли скрипт уже
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject());
    document.body.appendChild(script);
  });
}

// ВАЖНО: замени на актуальный URL из документации/договора
const VtbSdkUrl =
  "https://platezh.vtb24.ru/payment/modules/multiframe/main.js";
// или, если у тебя sandbox:
// const VtbSdkUrl = "https://sandbox.vtb.ru/payment/modules/multiframe/main.js";

export function Equaring({ item, setPage, equairing }: EquaringProps) {
  const [load, setLoad] = useState(false);
  const [info, setInfo] = useState<any>(null); // res.data
  const [initError, setInitError] = useState<string | null>(null);

  const panRef = useRef<HTMLDivElement | null>(null);
  const expiryRef = useRef<HTMLDivElement | null>(null);
  const cvcRef = useRef<HTMLDivElement | null>(null);
  const selectBindingRef = useRef<HTMLSelectElement | null>(null);
  const saveCardContainerRef = useRef<HTMLInputElement | null>(null);
  const payButtonRef = useRef<HTMLButtonElement | null>(null);

  const webSdkPaymentFormRef = useRef<any | null>(null);

  // 1. Получаем order и грузим скрипт SDK
  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        setLoad(true);
        setInitError(null);

        // Загружаем SDK
        await addScript(VtbSdkUrl);

        const res = await equairing(item.order);

        if (res.error) {
          setPage(4);
          return;
        }

        // res.data содержит orderId и прочие данные
        setInfo(res.data);

      } catch (e) {
        console.error("prepare error", e);
        if (!cancelled) {
          setInitError("Ошибка инициализации платёжной формы");
        }
      } finally {
        if (!cancelled) {
          setLoad(false);
        }
      }
    }

    prepare();

    return () => {
      cancelled = true;
    };
  }, [equairing, item.order, setPage]);

  // 2. Инициализируем PaymentForm, когда info есть и refs смонтированы
  useEffect(() => {
    // Пока нет данных заказа – ничего не делаем
    if (!info) return;

    // Пока не смонтированы контейнеры – ждём
    if (!panRef.current || !expiryRef.current || !cvcRef.current) return;

    // Проверяем, что SDK реально положил что-то в window
    if (!window.PaymentForm) {
      console.error("window.PaymentForm is not defined", window);
      setInitError("SDK ВТБ не инициализировался. Проверьте URL скрипта.");
      return;
    }

    if (typeof window.PaymentForm !== "function") {
      console.error(
        "window.PaymentForm is not a constructor. Type:",
        typeof window.PaymentForm,
        window.PaymentForm
      );
      setInitError(
        "Неверный тип PaymentForm из SDK. Проверьте актуальную документацию/URL."
      );
      return;
    }

    const mdOrder = info.orderId;

    const webSdkPaymentForm = new window.PaymentForm({
      mdOrder,
      containerClassName: "field-container",
      onFormValidate: (isValid: boolean) => {
        if (payButtonRef.current) {
          payButtonRef.current.disabled = !isValid;
        }
      },
      apiContext: "/payment",
      language: "ru",
      autoFocus: true,
      showPanIcon: true,
      fields: {
        pan: {
          container: panRef.current,
        },
        expiry: {
          container: expiryRef.current,
        },
        cvc: {
          container: cvcRef.current,
        },
      },
      styles: {
        base: {
          padding: "0px 16px",
          color: "black",
          fontSize: "18px",
          fontFamily: "monospace",
        },
        focus: {
          color: "blue",
        },
        disabled: {
          color: "gray",
        },
        valid: {
          color: "green",
        },
        invalid: {
          color: "red",
        },
        placeholder: {
          base: {
            color: "gray",
          },
          focus: {
            color: "transparent",
          },
        },
      },
    });

    webSdkPaymentFormRef.current = webSdkPaymentForm;

    webSdkPaymentForm
      .init()
      .then(({ orderSession }: any) => {
        // биндинги, если есть
        if (selectBindingRef.current) {
          if (orderSession.bindings && orderSession.bindings.length) {
            selectBindingRef.current.style.display = "";
            orderSession.bindings.forEach((binding: any) => {
              const option = new Option(binding.pan, binding.id);
              selectBindingRef.current!.options.add(option);
            });
          } else {
            selectBindingRef.current.style.display = "none";
          }
        }

        if (saveCardContainerRef.current) {
          if (orderSession.bindingEnabled) {
            saveCardContainerRef.current.style.display = "";
          } else {
            saveCardContainerRef.current.style.display = "none";
          }
        }
      })
      .catch((e: any) => {
        console.error("PaymentForm.init error", e);
        setInitError("Ошибка инициализации платёжной формы");
      });

    return () => {
      try {
        webSdkPaymentForm.destroy();
      } catch (e) {
        console.error("PaymentForm.destroy error", e);
      }
      webSdkPaymentFormRef.current = null;
    };
  }, [info]);

  const handlePayment = () => {

    setLoad( true);
    if (!webSdkPaymentFormRef.current) return;

    if (payButtonRef.current) {
      payButtonRef.current.disabled = true;
    }

    webSdkPaymentFormRef.current
      .doPayment({
        saveCard: !!saveCardContainerRef.current?.checked,
      })
      .then((result: any) => {
        // TODO: обработка успешного платежа
        // например:
        // setPage(5);
        // или запрос статуса /payment/rest/getOrderStatusExtended.do
      })
      .catch((e: any) => {
        console.error("doPayment error", e);
        alert("Ошибка платежа");
      })
      .finally(() => {
        setLoad(false)
        if (payButtonRef.current) {
          payButtonRef.current.disabled = false;
        }
      });
  };

  const handleSelectBinding = () => {
    if (!webSdkPaymentFormRef.current || !selectBindingRef.current) return;

    const bindingId = selectBindingRef.current.value;
    if (bindingId !== "new_card") {
      webSdkPaymentFormRef.current.selectBinding(bindingId);
      if (saveCardContainerRef.current) {
        saveCardContainerRef.current.style.display = "none";
      }
    } else {
      webSdkPaymentFormRef.current.selectBinding(null);
      if (saveCardContainerRef.current) {
        saveCardContainerRef.current.style.display = "";
      }
    }
  };

  return (
    <>
      <IonLoading isOpen={load} message={"Подождите..."} />

      {initError && <div className="vtb-error text-center">{initError}</div>}

      {info && (
        <div className="vtb-payment-page">
          <div className="vtb-payment-card">
            <div className="vtb-card-header">
              <div className="vtb-logo" />
              <div className="vtb-title-block">
                <div className="vtb-title">Оплата заказа</div>
                <div className="vtb-subtitle">Через эквайринг ВТБ</div>
              </div>
            </div>

            <div className="vtb-card-body">
              <div
                className="vtb-row"
                id="select-binding-container"
                onChange={handleSelectBinding}
              >
                <label className="vtb-label" htmlFor="select-binding">
                  Выбор карты
                </label>
                <select
                  className="vtb-select"
                  id="select-binding"
                  ref={selectBindingRef}
                  aria-label="Select card"
                >
                  <option value="new_card">Оплатить новой картой</option>
                </select>
              </div>

              <div className="vtb-row">
                <label htmlFor="pan" className="vtb-label">
                  Номер карты
                </label>
                <div id="pan" className="vtb-input" ref={panRef}></div>
              </div>

              <div className="vtb-row vtb-row-inline">
                <div className="vtb-col">
                  <label htmlFor="expiry" className="vtb-label">
                    Срок действия
                  </label>
                  <div
                    id="expiry"
                    className="vtb-input"
                    ref={expiryRef}
                  ></div>
                </div>

                <div className="vtb-col">
                  <label htmlFor="cvc" className="vtb-label">
                    CVC / CVV
                  </label>
                  <div id="cvc" className="vtb-input" ref={cvcRef}></div>
                </div>
              </div>

              <label className="vtb-save-card" id="save-card-container">
                <input
                  className="form-check-input me-1"
                  ref={saveCardContainerRef}
                  type="checkbox"
                  id="save-card"
                />
                Сохранить карту
              </label>
            </div>

            <div className="vtb-card-footer">
              <button
                className="vtb-pay-button"
                type="button"
                id="pay"
                ref={payButtonRef}
                onClick={handlePayment}
              >
                Оплатить
              </button>
            </div>

            <div
              className="vtb-error-text visually-hidden"
              id="error"
            ></div>
          </div>
        </div>
      )}
    </>
  );
}
