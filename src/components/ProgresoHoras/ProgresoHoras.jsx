import { LockKey, PencilSimple } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import "./ProgresoHoras.css";

const SEGUNDO = 1000;
const META_DIARIA_DEFAULT = 480;
const META_SEMANAL = 2400;

const segundos = (...valores) => {
    for (const valor of valores) {
        if (valor === null || valor === undefined || valor === "") continue;
        const numero = typeof valor === "string" && valor.includes(":")
            ? valor.split(":").reduce((total, parte) => (total * 60) + Number(parte || 0), 0)
            : Number(valor);
        if (!Number.isNaN(numero)) {
            return Math.max(0, Math.round(numero > 1000 ? numero : numero * 3600));
        }
    }
    return 0;
};

const duracion = (minutos) => {
    const valor = Math.max(0, Math.floor(Number(minutos) || 0));
    const horas = Math.floor(valor / 60);
    const resto = valor % 60;
    return `${horas}h ${String(resto).padStart(2, "0")}m`;
};

const reloj = (minutos) => {
    const valor = Math.max(0, Math.floor(Number(minutos) || 0));
    return `${String(Math.floor(valor / 60)).padStart(2, "0")}:${String(valor % 60).padStart(2, "0")}`;
};

const valorResumenSegundos = (valor, unidad) => {
    if (valor === null || valor === undefined || valor === "") return 0;
    if (typeof valor === "string") {
        if (valor.includes(":")) {
            return valor.split(":").reduce((total, parte, index, partes) => (
                index === partes.length - 1
                    ? total + Number(parte || 0)
                    : (total + Number(parte || 0)) * 60
            ), 0);
        }
    }
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < 0) return 0;
    if (unidad === "segundos") return numero;
    if (unidad === "minutos") return numero * 60;
    if (unidad === "horas") return numero * 3600;
    return numero;
};

const fechaHoraRegistro = (registro) => {
    const valor = registro?.hora || registro?.fecha || registro?.timestamp;
    if (!valor) return null;
    const horaSimple = /^\d{2}:\d{2}(?::\d{2})?$/.exec(String(valor));
    if (horaSimple) {
        const [horas, minutos, segundosValor = "0"] = horaSimple[0].split(":");
        const fecha = new Date();
        fecha.setHours(Number(horas), Number(minutos), Number(segundosValor), 0);
        return fecha;
    }
    const fechaIsoCompleta = String(valor);
    const horaIso = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)/.exec(fechaIsoCompleta);
    if (horaIso) {
        const fecha = new Date(`${horaIso[1]}T${horaIso[2]}`);
        if (!Number.isNaN(fecha.getTime())) return fecha;
    }
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const calcularTiempoDesdeRegistros = (registros, ahora, estado) => {
    const eventos = Array.isArray(registros) ? registros : [];
    const entrada = [...eventos]
        .reverse()
        .find((registro) => registro.tipo === "ENTRADA");
    const entradaFecha = fechaHoraRegistro(entrada);
    if (!entradaFecha || !(ahora instanceof Date) || Number.isNaN(ahora.getTime())) {
        return { trabajados: 0, break: 0 };
    }

    const entradaMs = entradaFecha.getTime();
    const salida = eventos.find((registro) => (
        registro.tipo === "SALIDA"
        && fechaHoraRegistro(registro)?.getTime() >= entradaMs
    ));
    const salidaFecha = salida ? fechaHoraRegistro(salida) : null;
    const finJornadaMs = estado === "FINALIZADO" && salidaFecha
        ? salidaFecha.getTime()
        : ahora.getTime();

    let breakMs = 0;
    let inicioBreakActivoMs = null;
    eventos.forEach((registro) => {
        const fecha = fechaHoraRegistro(registro);
        if (!fecha || fecha.getTime() < entradaMs) return;
        if (registro.tipo === "BREAK_INICIO") inicioBreakActivoMs = fecha.getTime();
        if (registro.tipo === "BREAK_FIN" && inicioBreakActivoMs !== null) {
            breakMs += Math.max(
                0,
                Math.min(fecha.getTime(), finJornadaMs) - inicioBreakActivoMs
            );
            inicioBreakActivoMs = null;
        }
    });
    if (inicioBreakActivoMs !== null) {
        breakMs += Math.max(0, finJornadaMs - inicioBreakActivoMs);
    }
    const inicioBreakVisible = eventos
        .slice()
        .reverse()
        .find((registro) => registro.tipo === "BREAK_INICIO" && fechaHoraRegistro(registro)?.getTime() >= entradaMs);

    const inicioBreakFecha = fechaHoraRegistro(inicioBreakVisible);
    const inicioBreakMs = inicioBreakFecha?.getTime() ?? null;
    const finBreakVisibleMs = inicioBreakActivoMs !== null
        ? finJornadaMs
        : (() => {
            const ultimoFinBreak = [...eventos]
                .reverse()
                .find((registro) => registro.tipo === "BREAK_FIN"
                    && fechaHoraRegistro(registro)?.getTime() >= entradaMs);
            return fechaHoraRegistro(ultimoFinBreak)?.getTime() ?? inicioBreakMs;
        })();
    const trabajoAntesBreakMs = inicioBreakMs !== null
        ? Math.max(0, inicioBreakMs - entradaMs)
        : 0;
    const breakVisibleMs = inicioBreakMs !== null && finBreakVisibleMs !== null
        ? Math.max(0, finBreakVisibleMs - inicioBreakMs)
        : 0;
    const trabajadosMs = Math.max(0, finJornadaMs - entradaMs - breakMs);

    return {
        trabajados: trabajadosMs / 1000,
        break: breakMs / 1000,
        antesBreak: trabajoAntesBreakMs / 1000,
        despuesBreak: inicioBreakMs !== null
            ? Math.max(0, trabajadosMs - trabajoAntesBreakMs) / 1000
            : 0,
    };
};

const punto = (angulo, radio) => {
    const radianes = (angulo - 90) * Math.PI / 180;
    return { x: 210 + radio * Math.cos(radianes), y: 210 + radio * Math.sin(radianes) };
};

const Barra = ({ valor, meta, clase }) => {
    const progreso = meta > 0 ? Math.min(100, Math.max(0, (valor / meta) * 100)) : 0;
    return (
        <div className={`progreso-barra ${clase}`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progreso)}>
            <span style={{ width: `${progreso}%` }} />
        </div>
    );
};

const ProgresoHoras = ({
    datos = null,
    minutosTrabajadosHoy,
    inicioBreak,
    duracionBreak,
    metaDiaria,
    estado = "SIN_ENTRADA",
    registros = [],
    horaActual = null,
}) => {
    const [error, setError] = useState("");
    const [ahoraLocal, setAhoraLocal] = useState(() => new Date());
    const [metaGuardada, setMetaGuardada] = useState(META_DIARIA_DEFAULT);
    const [horas, setHoras] = useState("08");
    const [minutos, setMinutos] = useState("00");
    const [editando, setEditando] = useState(false);

    const activoReloj = estado === "TRABAJANDO" || estado === "EN_BREAK";
    useEffect(() => {
        if (!activoReloj) return undefined;
        const intervalo = window.setInterval(() => {
            setAhoraLocal(new Date());
        }, SEGUNDO);
        return () => window.clearInterval(intervalo);
    }, [activoReloj, estado]);

    const diario = datos?.diario || {};
    const semanal = datos?.semanal || {};
    const tiempoRegistros = calcularTiempoDesdeRegistros(
        registros,
        ahoraLocal,
        estado
    );
    const trabajoBaseSegundos = registros.length > 0
        ? tiempoRegistros.trabajados
        : minutosTrabajadosHoy !== undefined
        ? Number(minutosTrabajadosHoy || 0) * 60
        : diario.trabajando_segundos !== null
            && diario.trabajando_segundos !== undefined
            && diario.trabajando_segundos !== ""
        ? valorResumenSegundos(diario.trabajando_segundos, "segundos")
        : segundos(diario.trabajado_segundos, diario.tiempo_trabajado, diario.trabajado, diario.trabajado_horas);
    const breakBaseSegundos = registros.length > 0
        ? tiempoRegistros.break
        : duracionBreak !== undefined
        ? Number(duracionBreak || 0) * 60
        : segundos(diario.break_segundos, diario.tiempo_break, diario.break, diario.break_horas);
    const minutosHoy = trabajoBaseSegundos / 60;
    const minutosBreak = breakBaseSegundos / 60;
    const segundosSemanaBackend = valorResumenSegundos(
        semanal.trabajadas_segundos,
        "segundos"
    );
    const segundosDiaBackend = diario.trabajando_segundos !== null
        && diario.trabajando_segundos !== undefined
        && diario.trabajando_segundos !== ""
        ? valorResumenSegundos(diario.trabajando_segundos, "segundos")
        : diario.trabajado_segundos !== null
            && diario.trabajado_segundos !== undefined
            && diario.trabajado_segundos !== ""
        ? valorResumenSegundos(diario.trabajado_segundos, "segundos")
        : segundos(
            diario.tiempo_trabajado,
            diario.trabajado,
            diario.trabajado_horas
        );
    const segundosSemanaRecibidos = segundosSemanaBackend;
    const [baseSemana, setBaseSemana] = useState(() => ({
        semanaBackend: segundosSemanaRecibidos,
        diaBackend: segundosDiaBackend,
        semanaRecibida: segundosSemanaRecibidos,
        diaRecibido: segundosDiaBackend,
    }));

    if (
        baseSemana.semanaRecibida !== segundosSemanaRecibidos
        || baseSemana.diaRecibido !== segundosDiaBackend
    ) {
        setBaseSemana({
            semanaBackend: segundosSemanaRecibidos,
            diaBackend: segundosDiaBackend,
            semanaRecibida: segundosSemanaRecibidos,
            diaRecibido: segundosDiaBackend,
        });
    }

    const segundosSemana = activoReloj
        ? baseSemana.semanaBackend + (trabajoBaseSegundos - baseSemana.diaBackend)
        : segundosSemanaBackend;
    const minutosSemana = segundosSemana / 60;
    const minutosMetaSemana = Number(semanal.meta_ajustada_horas || META_SEMANAL / 60) * 60;
    const metaMinutos = metaDiaria !== undefined ? Number(metaDiaria) : metaGuardada;
    const cumpleMeta = minutosHoy >= metaMinutos;
    const colorHoy = cumpleMeta ? "#34d399" : "#38bdf8";
    const progresoHoy = metaMinutos > 0 ? Math.min(100, (minutosHoy / metaMinutos) * 100) : 0;
    const progresoSemana = minutosMetaSemana > 0
        ? Math.min(100, (minutosSemana / minutosMetaSemana) * 100)
        : 0;
    const minutosAntesBreak = registros.length > 0
        ? Math.min(minutosHoy, tiempoRegistros.antesBreak / 60)
        : Math.max(0, minutosHoy - minutosBreak);
    const minutosDespuesBreak = registros.length > 0
        ? Math.max(0, tiempoRegistros.despuesBreak / 60)
        : minutosHoy;
    const breakPorcentaje = metaMinutos > 0 ? Math.min(100, (minutosBreak / metaMinutos) * 100) : 0;
    const progresoAntesBreak = metaMinutos > 0
        ? Math.min(100, (minutosAntesBreak / metaMinutos) * 100)
        : 0;
    const progresoDespuesBreak = metaMinutos > 0
        ? Math.min(100 - progresoAntesBreak - breakPorcentaje, (minutosDespuesBreak / metaMinutos) * 100)
        : 0;
    const breakOffset = -progresoAntesBreak;
    const progresoDespuesOffset = -(progresoAntesBreak + breakPorcentaje);
    const pendientesSemana = Math.max(0, minutosMetaSemana - minutosSemana);

    const normalizarHoras = (valor) => valor.replace(/\D/g, "").slice(0, 2);
    const normalizarMinutos = (valor) => valor.replace(/\D/g, "").slice(0, 2);

    const iniciarEdicion = () => {
        const h = Math.floor(metaMinutos / 60);
        const m = metaMinutos % 60;
        setHoras(String(h).padStart(2, "0"));
        setMinutos(String(m).padStart(2, "0"));
        setError("");
        setEditando(true);
        requestAnimationFrame(() => document.getElementById("progreso-meta-horas")?.focus());
    };

    const confirmar = () => {
        let h = Number(horas || 0);
        let m = Number(minutos || 0);
        if (h === 12) m = 0;
        if (h > 12) {
            setError("El máximo permitido es 12 h al día");
            return;
        }
        if (h === 0 && m < 60) {
            setError("La meta mínima es 1 h");
            return;
        }
        if (h < 1) {
            setError("La meta mínima es 1 h");
            return;
        }
        const nuevaMeta = (h * 60) + Math.min(59, m);
        setMetaGuardada(nuevaMeta);
        setHoras(String(h).padStart(2, "0"));
        setMinutos(String(Math.min(59, m)).padStart(2, "0"));
        setError("");
        setEditando(false);
    };

    const alCambiarHoras = (valor) => {
        const limpio = normalizarHoras(valor);
        setHoras(limpio === "" ? "" : String(Math.min(12, Number(limpio))).padStart(limpio.length > 1 ? 2 : 1, "0"));
        if (Number(limpio) === 12) setMinutos("00");
        setError("");
    };

    const alCambiarMinutos = (valor) => {
        const limpio = normalizarMinutos(valor);
        setMinutos(limpio === "" ? "" : String(Math.min(59, Number(limpio))).padStart(limpio.length > 1 ? 2 : 1, "0"));
        setError("");
    };

    const completarCampo = (valor, tipo, maximo) => {
        const numero = Number(valor || 0);
        const seguro = Math.min(maximo, Math.max(0, numero));
        if (tipo === "horas") setHoras(String(seguro).padStart(2, "0"));
        else setMinutos(String(seguro).padStart(2, "0"));
    };

    const ticksSemanales = useMemo(() => Array.from({ length: 8 }, (_, index) => {
        const hora = index * 5;
        const angulo = (hora / 40) * 360;
        const exterior = punto(angulo, 177);
        const interior = punto(angulo, 170);
        const etiqueta = punto(angulo, 190);
        return { hora, interior, exterior, etiqueta };
    }), []);

    const ticksDiarios = useMemo(() => {
        const totalMarcas = Math.ceil(metaMinutos / 60);
        const superioresPermitidas = metaMinutos === 480 ? 22 : 26;
        return Array.from({ length: totalMarcas + 1 }, (_, index) => {
            const hora = index;
            const angulo = (hora * 60 / metaMinutos) * 360;
            return {
                hora,
                angulo,
                interior: punto(angulo, 126),
                exterior: punto(angulo, 121),
                etiqueta: punto(angulo, 110),
                mostrarNumero: hora > 0 && Math.abs(angulo) > superioresPermitidas && Math.abs(360 - angulo) > superioresPermitidas,
            };
        }).filter((tick) => tick.hora * 60 <= metaMinutos);
    }, [metaMinutos]);

    const horaInicioBreak = inicioBreak || null;
    const bloqueadoPorTurno = activoReloj;

    return (
        <section className="progreso-horas" aria-labelledby="progreso-horas-titulo">
            <header className="progreso-horas-header">
                <h2 id="progreso-horas-titulo">Mi progreso de horas</h2>
                <div className={`progreso-meta-editor ${error ? "con-error" : ""} ${editando ? "editando" : ""}`}>
                    <span className="progreso-meta-etiqueta">Meta diaria</span>
                    <div className="progreso-meta-campos">
                        <label>
                            <span className="sr-only">Horas de la meta diaria</span>
                            <input
                                id="progreso-meta-horas"
                                aria-label="Horas de la meta diaria"
                                type="text"
                                inputMode="numeric"
                                value={horas}
                                disabled={!editando || bloqueadoPorTurno}
                                onChange={(evento) => alCambiarHoras(evento.target.value)}
                                onBlur={() => completarCampo(horas, "horas", 12)}
                            />
                            <span>h</span>
                        </label>
                        <label>
                            <span className="sr-only">Minutos de la meta diaria</span>
                            <input
                                aria-label="Minutos de la meta diaria"
                                type="text"
                                inputMode="numeric"
                                value={minutos}
                                disabled={!editando || bloqueadoPorTurno}
                                onChange={(evento) => alCambiarMinutos(evento.target.value)}
                                onBlur={() => completarCampo(minutos, "minutos", 59)}
                            />
                            <span>m</span>
                        </label>
                    </div>
                </div>
                <div className="progreso-meta-botones">
                    <button type="button" onClick={iniciarEdicion} disabled={editando || bloqueadoPorTurno} title={bloqueadoPorTurno ? "Meta bloqueada durante el turno" : "Editar meta diaria"}>
                        {bloqueadoPorTurno ? <LockKey size={16} /> : <PencilSimple size={16} />}
                        Editar
                    </button>
                    <button type="button" className="confirmar" disabled={!editando || bloqueadoPorTurno} onClick={confirmar}>Confirmar</button>
                </div>
            </header>
            {error && <div className="progreso-horas-error" role="alert">{error}</div>}
            <div className={`progreso-horas-cuerpo ${datos === null ? "progreso-datos-pendientes" : ""}`}>
                    <div className="progreso-rueda">
                        <svg viewBox="0 0 420 420" role="img" aria-labelledby="progreso-svg-titulo progreso-svg-desc">
                            <title id="progreso-svg-titulo">Progreso diario y semanal</title>
                            <desc id="progreso-svg-desc">Anillo semanal de 40 horas y anillo diario con trabajo y break.</desc>
                            <g className="escala-semanal" aria-hidden="true">
                                {ticksSemanales.map((tick) => (
                                    <g key={tick.hora}>
                                        <line x1={tick.interior.x} y1={tick.interior.y} x2={tick.exterior.x} y2={tick.exterior.y} />
                                        {tick.hora > 0 && <text x={tick.etiqueta.x} y={tick.etiqueta.y} textAnchor="middle" dominantBaseline="middle">{tick.hora}</text>}
                                    </g>
                                ))}
                                {(() => {
                                    const limite = punto(0, 190);
                                    return <text className="duplicado-semanal" x={limite.x} y={limite.y} textAnchor="middle" dominantBaseline="middle">40</text>;
                                })()}
                            </g>
                            <g className="escala-diaria" aria-hidden="true">
                                {ticksDiarios.map((tick) => (
                                    <g key={tick.hora}>
                                        <line x1={tick.exterior.x} y1={tick.exterior.y} x2={tick.interior.x} y2={tick.interior.y} />
                                        {tick.hora > 0 && tick.mostrarNumero && (
                                            <text x={tick.etiqueta.x} y={tick.etiqueta.y} textAnchor="middle" dominantBaseline="middle">{tick.hora}</text>
                                        )}
                                    </g>
                                ))}
                                {(() => {
                                    const limite = punto(0, 110);
                                    const texto = metaMinutos % 60
                                        ? `${Math.floor(metaMinutos / 60)}:${String(metaMinutos % 60).padStart(2, "0")}`
                                        : String(metaMinutos / 60);
                                    return <text x={limite.x} y={limite.y} textAnchor="middle" dominantBaseline="middle">{texto}</text>;
                                })()}
                            </g>
                            <circle className="rueda-pista semana" cx="210" cy="210" r="160" />
                            <circle className="rueda-progreso semana" cx="210" cy="210" r="160" pathLength="100" strokeDasharray={`${progresoSemana} ${100 - progresoSemana}`} transform="rotate(-90 210 210)" />
                            <circle className="rueda-pista dia" cx="210" cy="210" r="139" />
                            {minutosBreak > 0 ? (
                                <>
                                    <circle className="rueda-progreso dia" cx="210" cy="210" r="139" pathLength="100" strokeDasharray={`${progresoAntesBreak} ${100 - progresoAntesBreak}`} transform="rotate(-90 210 210)" style={{ stroke: colorHoy }} />
                                    <circle className="rueda-break" cx="210" cy="210" r="139" pathLength="100" strokeDasharray={`${breakPorcentaje} ${100 - breakPorcentaje}`} strokeDashoffset={breakOffset} transform="rotate(-90 210 210)" />
                                    {progresoDespuesBreak > 0 && (
                                        <circle className="rueda-progreso dia" cx="210" cy="210" r="139" pathLength="100" strokeDasharray={`${progresoDespuesBreak} ${100 - progresoDespuesBreak}`} strokeDashoffset={progresoDespuesOffset} transform="rotate(-90 210 210)" style={{ stroke: colorHoy }} />
                                    )}
                                </>
                            ) : (
                                <circle className="rueda-progreso dia" cx="210" cy="210" r="139" pathLength="100" strokeDasharray={`${progresoHoy} ${100 - progresoHoy}`} transform="rotate(-90 210 210)" style={{ stroke: colorHoy }} />
                            )}
                            {minutosHoy > 0 && (() => {
                                const punta = punto(Math.min(360, progresoHoy * 3.6), 139);
                                return <circle className="rueda-punta" cx={punta.x} cy={punta.y} r="12" style={{ fill: colorHoy }} />;
                            })()}
                            <g className={`rueda-centro ${activoReloj ? "activo" : ""}`}>
                                <text className="rueda-etiqueta" x="210" y="190" textAnchor="middle">HORAS HOY</text>
                                <text className="rueda-tiempo" x="210" y="225" textAnchor="middle">{reloj(minutosHoy)}</text>
                                <text className="rueda-meta" x="210" y="250" textAnchor="middle">
                                    {cumpleMeta ? "Meta cumplida" : `Meta ${duracion(metaMinutos)}`}
                                </text>
                            </g>
                        </svg>
                    </div>

                    <aside className="progreso-resumen">
                        <div className={`reloj-activo ${activoReloj ? "activo" : ""}`}>
                            <i />
                            {activoReloj ? `Reloj activo desde las ${horaInicioBreak ? reloj(horaInicioBreak) : "00:00"}` : "Reloj detenido"}
                        </div>
                        <article className="tarjeta-resumen">
                            <div className="tarjeta-resumen-titulo"><span>Hoy</span><strong>{duracion(minutosHoy)} / {duracion(metaMinutos)}</strong></div>
                            <Barra valor={minutosHoy} meta={metaMinutos} clase={cumpleMeta ? "completo" : "diario"} />
                        </article>
                        <article className="tarjeta-resumen">
                            <div className="tarjeta-resumen-titulo"><span>Semana</span><strong>{duracion(minutosSemana)} / {duracion(minutosMetaSemana)}</strong></div>
                            <Barra valor={minutosSemana} meta={minutosMetaSemana} clase="semanal" />
                        </article>
                        <div className="progreso-leyenda">
                            <span><i className="trabajo" />Trabajo diario</span>
                            <span><i className="break" />Break ({duracion(minutosBreak)})</span>
                            <span><i className="semana" />Semana</span>
                        </div>
                        {pendientesSemana > 0 && (
                            <div className="progreso-aviso">Te faltan {duracion(pendientesSemana)} para completar la semana</div>
                        )}
                    </aside>
                </div>
        </section>
    );
};

export default ProgresoHoras;
