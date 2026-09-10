import { ProcessStep } from "../domain/ProcessStep";

export const sampleSteps: ProcessStep[] = [
  {
    id: "step-01",
    title: "Preparar requisición",
    actor: "ShippingOffice",
    type: "task",
    description: "La oficina de envíos prepara una requisición para el producto que debe pedirse.",
  },
  {
    id: "step-02",
    title: "Preparar solicitud de cotización",
    actor: "BuyerAgent",
    type: "task",
    description: "El agente comprador redacta una solicitud de cotización a partir de la requisición.",
  },
  {
    id: "step-03",
    title: "¿Necesita revisión?",
    actor: "BuyerAgent",
    type: "decision",
    description: "Se decide si la solicitud de cotización requiere revisión del supervisor antes de enviarse.",
  },
  {
    id: "step-04",
    title: "Evaluación de la solicitud",
    actor: "Supervisor",
    type: "task",
    description: "El supervisor evalúa la solicitud de cotización en cuanto a corrección y completitud.",
  },
  {
    id: "step-05",
    title: "¿Aprueba?",
    actor: "Supervisor",
    type: "decision",
    description: "El supervisor decide si aprueba la solicitud de cotización.",
  },
  {
    id: "step-06",
    title: "Revisar solicitud de cotización",
    actor: "Seller",
    type: "task",
    description: "El vendedor revisa la solicitud de cotización recibida del comprador.",
  },
  // Los pasos restantes del flujo (cotización, pedido, entrega y pago)
  // se agregan desde el formulario como parte del caso de estudio.
];
