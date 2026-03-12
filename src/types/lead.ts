import type { LineaNegocio, TipoInmueble } from './propiedad';

export type OrigenLead = 'contacto_web';

export interface Lead {
  id?: string;
  nombre: string;
  telefono: string;
  email?: string | null;
  mensaje: string;
  slugPropiedad?: string | null;
  lineaNegocio?: LineaNegocio | null;
  origen: OrigenLead;
  createdAt: Date;
}

export interface EnviarLeadContactoInput {
  nombre: string;
  telefono: string;
  email?: string | null;
  mensaje: string;
  slugPropiedad?: string | null;
}

export interface ContextoPropiedadContacto {
  slug: string;
  titulo: string;
  tipoInmueble: TipoInmueble;
  municipio: string;
  precio: number;
  lineaNegocio: LineaNegocio;
}

export type CampoLeadFormulario = 'nombre' | 'telefono' | 'email' | 'mensaje';

export type ErroresLeadFormulario = Partial<
  Record<CampoLeadFormulario, string>
>;

export type ResultadoEnviarLeadContacto =
  | {
      ok: true;
      leadId: string;
      mensaje: string;
    }
  | {
      ok: false;
      mensaje: string;
      errores?: ErroresLeadFormulario;
    };
