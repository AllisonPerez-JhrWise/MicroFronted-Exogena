"use client";

import { useId, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/http/api-error";
import { MensajeError } from "@/shared/components/query-state";
import { formatNit, VACIO } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Campo } from "@/shared/ui/campo";
import { IconoAtras, IconoMas } from "@/shared/ui/iconos";
import { Mensaje } from "@/shared/ui/mensaje";
import { useCrearCliente } from "../../hooks/use-crear-cliente";
import type { Compromiso } from "../../schemas/compromiso.schema";
import type { SeleccionGrupo } from "../../schemas/grupo.schema";
import { dividirNombre, type Organizacion } from "../../schemas/organizacion.schema";
import { nombreDelRut, type Rut } from "../../schemas/rut.schema";
import {
  MENSAJE_CARGO_PRINCIPAL,
  USUARIO_VACIO,
  usuarioSchema,
  type CampoUsuario,
  type ClienteCreado,
  type Usuario,
} from "../../schemas/usuario.schema";

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const nombreCompleto = (u: Usuario) => `${u.nombres} ${u.apellidos}`.trim();

// Nombres legibles de los campos que el servicio puede rechazar (422).
const CAMPOS_API: Record<string, string> = {
  group_id: "grupo",
  group_name: "grupo",
  nit: "NIT",
  dv: "dígito de verificación",
  person_type: "tipo de persona",
  taxpayer_type: "tipo de contribuyente",
  legal_name: "razón social",
  first_name: "nombres",
  last_name: "apellidos",
  address: "dirección",
  department_code: "departamento",
  city_code: "municipio",
  rut_email: "correo del RUT",
  rut_phone: "teléfono del RUT",
  main_activity_code: "actividad principal",
  tax_responsibilities: "responsabilidades",
  rut_status: "estado del RUT",
  generated_at: "fecha de generación del RUT",
  rut_updated_at: "fecha de actualización del RUT",
  trade_name: "nombre comercial",
  contact_name: "contacto principal",
  contact_email: "correo de contacto",
  contact_phone: "teléfono de contacto",
  notes: "notas",
  service_id: "servicio",
  fiscal_year: "año gravable",
  due_date: "vencimiento",
  partner_user_id: "socio",
  manager_user_id: "gerente",
  email: "correo",
  phone: "celular",
  position: "cargo",
};

/** `details` de un error de back_exogena, con las formas que documenta la API. */
interface DetallesError {
  cause?: "rut_not_active" | "rut_too_old" | "rut_generated_in_future" | "nit_exists" | "group_exists";
  status?: string;
  days?: number;
  max_days?: number;
  company_id?: string;
  /** group_exists: el grupo existente con ese nombre. */
  group_id?: string;
  name?: string;
  email?: string;
  engagement?: number;
  field?: string;
}

const detallesDe = (error: unknown): DetallesError | null =>
  error instanceof ApiError && error.details && typeof error.details === "object" && !Array.isArray(error.details)
    ? (error.details as DetallesError)
    : null;

// ---------------------------------------------------------------------------

interface FilaNuevaProps {
  correosExistentes: string[];
  onGuardar: (usuario: Usuario) => void;
  onCancelar: () => void;
}

/** Fila editable al final de la tabla para agregar un usuario. */
function FilaNuevoUsuario({ correosExistentes, onGuardar, onCancelar }: FilaNuevaProps) {
  const id = useId();
  const [valores, setValores] = useState<Usuario>(USUARIO_VACIO);
  const [errores, setErrores] = useState<Partial<Record<CampoUsuario, string>>>({});

  const cambiar = (campo: CampoUsuario, valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const guardar = () => {
    const resultado = usuarioSchema.safeParse(valores);
    if (!resultado.success) {
      const nuevos: typeof errores = {};
      for (const issue of resultado.error.issues) nuevos[issue.path[0] as CampoUsuario] ??= issue.message;
      return setErrores(nuevos);
    }
    if (correosExistentes.includes(resultado.data.correo.toLowerCase())) {
      return setErrores({ correo: "Ya hay un usuario con este correo." });
    }
    onGuardar(resultado.data);
  };

  const campo = (nombre: CampoUsuario, etiqueta: string, extra: Partial<Parameters<typeof Campo>[0]> = {}) => (
    <Campo
      aria-label={etiqueta}
      placeholder={etiqueta}
      value={valores[nombre]}
      aria-invalid={Boolean(errores[nombre])}
      aria-describedby={errores[nombre] ? `${id}-errores` : undefined}
      className={errores[nombre] ? "border-wi-riesgo" : ""}
      onChange={(e) => cambiar(nombre, e.target.value)}
      {...extra}
    />
  );

  const listaErrores = Object.values(errores).filter(Boolean);

  return (
    <>
      <tr>
        <td>
          <div className="flex flex-col gap-2">
            {campo("nombres", "Nombres", { autoFocus: true, autoComplete: "off" })}
            {campo("apellidos", "Apellidos", { autoComplete: "off" })}
          </div>
        </td>
        <td>{campo("correo", "Correo", { type: "email", autoComplete: "off" })}</td>
        <td>{campo("celular", "Celular (opcional)", { type: "tel", inputMode: "tel", autoComplete: "off" })}</td>
        <td>{campo("cargo", "Cargo", { autoComplete: "off" })}</td>
        <td />
      </tr>
      <tr>
        <td colSpan={5}>
          <div className="flex items-center justify-end gap-3">
            <div
              id={`${id}-errores`}
              role={listaErrores.length ? "alert" : undefined}
              className="mr-auto text-apoyo text-wi-riesgo"
            >
              {listaErrores.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
            <Button variant="texto" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button onClick={guardar}>Guardar usuario</Button>
          </div>
        </td>
      </tr>
    </>
  );
}

// ---------------------------------------------------------------------------

/** Lo diligenciado en este paso; se conserva al ir y volver entre pasos. */
export interface DatosPasoUsuarios {
  /** Si el contacto del paso 2 se envía también como usuario. */
  incluirContacto: boolean;
  cargoContacto: string;
  usuarios: Usuario[];
}

interface PasoUsuariosProps {
  rut: Rut;
  organizacion: Organizacion;
  grupo: SeleccionGrupo | null;
  compromisos: Compromiso[];
  datosIniciales: DatosPasoUsuarios;
  /** Vuelve a otro paso guardando lo de este (0 = NIT y RUT, 2 = Compromisos). */
  onIrAPaso: (paso: number, datos: DatosPasoUsuarios) => void;
  /** Reemplaza el grupo elegido (p. ej. por el existente que sugiere group_exists). */
  onCambiarGrupo: (grupo: SeleccionGrupo) => void;
  onCreado: (cliente: ClienteCreado) => void;
}

export function PasoUsuarios({
  rut,
  organizacion,
  grupo,
  compromisos,
  datosIniciales,
  onIrAPaso,
  onCambiarGrupo,
  onCreado,
}: PasoUsuariosProps) {
  const idCargo = useId();
  const [incluirContacto, setIncluirContacto] = useState(datosIniciales.incluirContacto);
  const [cargoContacto, setCargoContacto] = useState(datosIniciales.cargoContacto);
  const [errorCargo, setErrorCargo] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>(datosIniciales.usuarios);
  const [agregando, setAgregando] = useState(false);
  const crear = useCrearCliente();

  const datosActuales: DatosPasoUsuarios = { incluirContacto, cargoContacto, usuarios };
  const nombreContacto = organizacion.contactoPrincipal.trim();
  const correoContacto = organizacion.correoContacto.trim().toLowerCase();

  /** El contacto del paso 2 como usuario (prellenado para no escribirlo dos veces). */
  const usuarioContacto = (): Usuario => {
    const { nombres, apellidos } = dividirNombre(organizacion.contactoPrincipal);
    return {
      nombres,
      apellidos,
      correo: organizacion.correoContacto.trim(),
      celular: organizacion.telefono.trim(),
      cargo: cargoContacto.trim(),
    };
  };

  // Si se omitió en el último intento, para repetirlo igual (p. ej. tras elegir el grupo sugerido).
  const [ultimoOmitir, setUltimoOmitir] = useState(false);

  /** Crea el cliente. «Omitir» envía la lista de usuarios vacía. */
  const enviar = (omitir: boolean, grupoUsar: SeleccionGrupo | null = grupo) => {
    if (!omitir && incluirContacto && !cargoContacto.trim()) {
      setErrorCargo(MENSAJE_CARGO_PRINCIPAL);
      document.getElementById(idCargo)?.focus();
      return;
    }
    setUltimoOmitir(omitir);
    const lista = omitir ? [] : [...(incluirContacto ? [usuarioContacto()] : []), ...usuarios];
    crear.mutate(
      { rut, organizacion, grupo: grupoUsar, compromisos, usuarios: lista },
      { onSuccess: onCreado },
    );
  };

  const error = crear.error;
  const detalles = detallesDe(error);
  // Correo que el servicio rechazó por pertenecer ya a otro cliente (409 con details.email).
  const correoEnConflicto =
    error instanceof ApiError && error.status === 409 && detalles?.email ? detalles.email.toLowerCase() : null;

  const quitar = (correo: string) => {
    crear.reset();
    if (correo === correoContacto) setIncluirContacto(false);
    else setUsuarios((us) => us.filter((u) => u.correo.toLowerCase() !== correo));
  };

  const mensajeError = (): ReactNode => {
    if (!error) return null;
    const irA = (paso: number, texto: string) => <Button onClick={() => onIrAPaso(paso, datosActuales)}>{texto}</Button>;

    // PENDIENTE: textos provisionales de los errores del RUT; reemplazar por los mensajes de la tarea.
    switch (detalles?.cause) {
      case "group_exists": {
        // El grupo nuevo ya existe (escrito distinto): se ofrece usar el del catálogo y reintentar.
        const existente = detalles.group_id && detalles.name ? { id: detalles.group_id, nombre: detalles.name } : null;
        return (
          <Mensaje
            nivel="atencion"
            titulo={existente ? `¿Quisiste decir ${existente.nombre}?` : "Ese grupo ya existe"}
            accion={
              existente && (
                <Button
                  onClick={() => {
                    const elegido: SeleccionGrupo = { tipo: "existente", ...existente };
                    onCambiarGrupo(elegido);
                    enviar(ultimoOmitir, elegido);
                  }}
                >
                  Usar {existente.nombre}
                </Button>
              )
            }
          >
            <p>
              Ya hay un grupo con ese nombre en el catálogo.{" "}
              {existente ? "Úsalo para no duplicarlo." : "Elígelo de la lista en «Datos del RUT»."}
            </p>
          </Mensaje>
        );
      }
      case "nit_exists":
        return (
          <Mensaje nivel="bloqueo" titulo={`Ya existe una empresa con el NIT ${formatNit(rut.nit ?? rut.typed_nit, rut.check_digit)}`}>
            <p>Búscala en el listado de clientes en lugar de crearla de nuevo.</p>
          </Mensaje>
        );
      case "rut_not_active":
        return (
          <Mensaje nivel="bloqueo" titulo="El RUT no está activo" accion={irA(0, "Cargar otro RUT")}>
            <p>
              Su estado es «{detalles.status ?? "desconocido"}». Solo se pueden crear clientes con el RUT activo.
            </p>
          </Mensaje>
        );
      case "rut_too_old":
        return (
          <Mensaje nivel="bloqueo" titulo={`El RUT se generó hace ${detalles.days ?? "más de"} días`} accion={irA(0, "Cargar otro RUT")}>
            <p>
              Se aceptan RUT generados hace máximo {detalles.max_days ?? 30} días. Descarga uno reciente y vuelve a
              cargarlo.
            </p>
          </Mensaje>
        );
      case "rut_generated_in_future":
        return (
          <Mensaje nivel="bloqueo" titulo="La fecha de generación del RUT es posterior a hoy" accion={irA(0, "Cargar otro RUT")}>
            <p>Revisa el documento y vuelve a cargarlo.</p>
          </Mensaje>
        );
    }

    // Error en un compromiso: details { engagement, field }.
    if (typeof detalles?.engagement === "number") {
      const c = compromisos[detalles.engagement];
      const campo = CAMPOS_API[detalles.field ?? ""] ?? detalles.field ?? "datos";
      return (
        <Mensaje
          nivel="bloqueo"
          titulo={`Revisa el compromiso ${c ? `${c.obligacionNombre} ${c.anioGravable}` : detalles.engagement + 1}`}
          accion={irA(2, "Ir a compromisos")}
        >
          <p>El servicio no aceptó el campo «{campo}».</p>
        </Mensaje>
      );
    }

    if (correoEnConflicto) {
      const u = usuarios.find((x) => x.correo.toLowerCase() === correoEnConflicto);
      const nombre = correoEnConflicto === correoContacto ? nombreContacto : u ? nombreCompleto(u) : correoEnConflicto;
      return (
        <Mensaje
          nivel="bloqueo"
          titulo={`${nombre} ya pertenece a otro cliente`}
          accion={<Button onClick={() => quitar(correoEnConflicto)}>Quitar usuario</Button>}
        >
          <p>Por ahora una persona no puede estar en dos clientes. Quítala de los usuarios para continuar.</p>
        </Mensaje>
      );
    }

    if (error instanceof ApiError && error.detallesValidacion.length) {
      const nombres = [...(incluirContacto ? [nombreContacto] : []), ...usuarios.map(nombreCompleto)];
      const lineas = error.detallesValidacion.map(({ loc }) => {
        const partes = loc.filter((p) => p !== "body");
        const campo = CAMPOS_API[String(partes.at(-1))] ?? String(partes.at(-1));
        if (partes[0] === "users" && typeof partes[1] === "number") return `${nombres[partes[1]] ?? "Usuario"}: ${campo}`;
        if (partes[0] === "engagements" && typeof partes[1] === "number") return `Compromiso ${partes[1] + 1}: ${campo}`;
        return `${partes[0] === "rut" ? "RUT" : "Organización"}: ${campo}`;
      });
      return (
        <Mensaje nivel="bloqueo" titulo="Hay datos que el servicio no aceptó">
          <p>Revisa: {[...new Set(lineas)].join(" · ")}.</p>
          {error.requestId && <p className="text-apoyo">Identificador para soporte: {error.requestId}</p>}
        </Mensaje>
      );
    }
    return <MensajeError error={error} />;
  };

  const totalUsuarios = usuarios.length + (incluirContacto ? 1 : 0);
  const ocupado = crear.isPending;
  const hayTabla = totalUsuarios > 0 || agregando;

  return (
    <div className="flex flex-col gap-5">
      {hayTabla ? (
        <div className="overflow-x-auto rounded-tarjeta border border-wi-borde">
          <table className="wi-tabla">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Celular</th>
                <th scope="col">Cargo en la empresa</th>
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Contacto del paso 2, prellenado para no crearlo dos veces. Se puede quitar. */}
              {incluirContacto && (
                <tr className={correoEnConflicto === correoContacto ? "text-wi-riesgo" : undefined}>
                  <td>{nombreContacto}</td>
                  <td>{organizacion.correoContacto}</td>
                  <td className="tabular-nums">{organizacion.telefono}</td>
                  <td>
                    <Campo
                      id={idCargo}
                      aria-label={`Cargo de ${nombreContacto}`}
                      placeholder="Cargo"
                      value={cargoContacto}
                      disabled={ocupado}
                      aria-invalid={Boolean(errorCargo)}
                      aria-describedby={errorCargo ? `${idCargo}-error` : undefined}
                      className={errorCargo ? "border-wi-riesgo" : ""}
                      onChange={(e) => {
                        setCargoContacto(e.target.value);
                        if (e.target.value.trim()) setErrorCargo(null);
                      }}
                    />
                    {errorCargo && (
                      <p id={`${idCargo}-error`} className="mt-1 text-apoyo text-wi-riesgo">
                        {errorCargo}
                      </p>
                    )}
                  </td>
                  <td className="text-right">
                    <Button
                      variant="texto"
                      disabled={ocupado}
                      aria-label={`Quitar a ${nombreContacto}`}
                      onClick={() => {
                        setErrorCargo(null);
                        quitar(correoContacto);
                      }}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              )}
              {usuarios.map((u) => (
                <tr key={u.correo} className={u.correo.toLowerCase() === correoEnConflicto ? "text-wi-riesgo" : undefined}>
                  <td>{nombreCompleto(u)}</td>
                  <td>{u.correo}</td>
                  <td className="tabular-nums">{u.celular || VACIO}</td>
                  <td>{u.cargo}</td>
                  <td className="text-right">
                    <Button
                      variant="texto"
                      disabled={ocupado}
                      aria-label={`Quitar a ${nombreCompleto(u)}`}
                      onClick={() => quitar(u.correo.toLowerCase())}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              ))}
              {agregando && (
                <FilaNuevoUsuario
                  correosExistentes={[
                    ...(incluirContacto ? [correoContacto] : []),
                    ...usuarios.map((u) => u.correo.toLowerCase()),
                  ]}
                  onCancelar={() => setAgregando(false)}
                  onGuardar={(nuevo) => {
                    crear.reset();
                    setUsuarios((us) => [...us, nuevo]);
                    setAgregando(false);
                  }}
                />
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-wi-secundario">Aún no hay usuarios para este cliente.</p>
      )}

      {!agregando && (
        <div className="flex flex-wrap items-center gap-5">
          <Button variant="texto" disabled={ocupado} onClick={() => setAgregando(true)}>
            <IconoMas />
            Agregar usuario
          </Button>
          {!incluirContacto && (
            <Button variant="texto" disabled={ocupado} onClick={() => setIncluirContacto(true)}>
              <IconoMas />
              Volver a agregar a {nombreContacto}
            </Button>
          )}
        </div>
      )}

      {mensajeError() ?? (
        <p className="rounded-tarjeta border border-wi-borde bg-wi-lienzo p-4 text-wi-texto">
          Se creará: <span className="font-semibold text-wi-tinta">{nombreDelRut(rut)}</span>
          {grupo && (
            <span className="ml-2 text-wi-secundario">
              en {grupo.nombre}
              {grupo.tipo === "nuevo" && " (grupo nuevo)"}
            </span>
          )}
          <span className="ml-5">{plural(compromisos.length, "compromiso", "compromisos")}</span>
          <span className="ml-5">
            {plural(totalUsuarios, "usuario del cliente", "usuarios del cliente")}
            {totalUsuarios > 0 && `, que ${totalUsuarios === 1 ? "recibirá" : "recibirán"} su bienvenida`}
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="mr-auto max-w-[280px] text-apoyo text-wi-secundario">
          {agregando
            ? "Guarda o cancela el usuario en edición para continuar."
            : "Puedes omitir este paso y crear los usuarios después."}
        </p>
        <Button disabled={ocupado} onClick={() => onIrAPaso(2, datosActuales)}>
          <IconoAtras />
          Atrás
        </Button>
        <Button disabled={ocupado || agregando} onClick={() => enviar(true)}>
          Omitir
        </Button>
        <Button variant="principal" disabled={ocupado || agregando} onClick={() => enviar(false)}>
          {ocupado ? "Creando cliente…" : "Crear cliente"}
        </Button>
      </div>
    </div>
  );
}
