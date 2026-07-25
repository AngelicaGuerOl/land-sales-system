# Manual de usuario

[Volver al README principal](../README.md)

Este manual describe el flujo de trabajo de Land Sales System para el negocio.
Los textos entre comillas corresponden a etiquetas visibles de la aplicación.

## 1. Iniciar sesión

1. Abre `http://localhost:5173`.
2. Captura tu usuario y contraseña.
3. Presiona "Iniciar sesión".

## 2. Consultar el resumen

1. Entra a "Dashboard" desde el menú lateral.
2. Revisa los indicadores de disponibilidad y las acciones rápidas.
3. Usa las acciones para ir a lotes, manzanas, ventas o estado de cuenta.

## 3. Registrar y administrar manzanas

1. Abre "Manzanas".
2. Presiona "Registrar manzana".
3. Captura el código, superficie y lotes planeados.
4. Presiona "Guardar".
5. Usa "Editar" para cambiar los datos permitidos.
6. Una manzana con lotes registrados no puede cambiar su código ni eliminarse.

La lotificación no se solicita en el formulario para registrar una manzana. El resumen y la consulta de lotes pueden funcionar aunque no exista una lotificación activa.

## 4. Registrar un lote

1. Abre "Lotes".
2. Presiona "Registrar lote".
3. Selecciona la manzana.
4. Captura número, código, superficie, frente, profundidad y precio.
5. Revisa la referencia de ubicación y observaciones si aplican.
6. Presiona "Guardar".

Los lotes nuevos comienzan disponibles. El código puede revisarse antes de
guardar y debe ser único.

## 5. Generar varios lotes

1. Entra a "Manzanas".
2. Abre el menú de acciones de la manzana.
3. Presiona "Generar lotes".
4. Captura el rango, prefijo, cantidad de dígitos y valores predeterminados.
5. Revisa la vista previa.
6. Presiona "Generar lotes".

La operación valida el rango y los conflictos antes de crear los registros.

## 6. Consultar el plano de referencia

1. Abre "Plano de referencia".
2. Consulta la imagen local del plano.
3. Usa "Ver en grande" para ampliar.
4. Usa "Ver PDF original" o "Descargar" cuando necesites el documento completo.

Si el plano no está disponible, la aplicación mostrará un mensaje informativo.

## 7. Registrar clientes

1. Abre "Clientes".
2. Presiona "Registrar cliente".
3. Captura nombre completo y teléfono principal.
4. Agrega teléfono alternativo y domicilio si corresponde.
5. Presiona "Guardar cliente".

Puedes buscar por nombre o teléfono, editar datos y activar o desactivar un
cliente. Desactivar conserva la información.

## 8. Registrar una venta

1. Abre "Nueva venta".
2. Busca y selecciona un cliente activo.
3. Selecciona uno o varios lotes disponibles.
4. Revisa el precio actual de referencia.
5. Define precio acordado, enganche y mensualidades para cada lote.
6. Revisa el resumen de la venta.
7. Presiona "Confirmar venta" y confirma la operación.

El sistema calcula los saldos, genera las mensualidades y cambia los lotes
seleccionados a vendidos dentro de una sola operación.

## 9. Consultar el historial de ventas

1. Abre "Historial de ventas".
2. Busca por folio, cliente, teléfono o lote.
3. Aplica estado y fechas cuando sea necesario.
4. Presiona "Ver detalle" para revisar la venta completa.

## 10. Consultar el estado de cuenta

1. Abre "Estado de cuenta".
2. Busca por nombre o teléfono.
3. Presiona "Ver estado de cuenta".
4. Revisa totales, lotes, mensualidades y saldos.

Los clientes inactivos pueden conservar obligaciones y aparecer en su estado
de cuenta.

## 11. Registrar un pago

1. Abre el estado de cuenta de un cliente con saldo pendiente.
2. Presiona "Registrar pago".
3. Selecciona el lote o lotes que recibirán el pago.
4. Selecciona las mensualidades en orden.
5. Elige "Efectivo" o "Transferencia".
6. Captura una referencia si la transferencia la requiere.
7. Presiona "Revisar pago".
8. Revisa el resumen y presiona "Confirmar pago".

Las mensualidades representan meses y no tienen una fecha límite específica.
Los pagos se aplican en orden y el sistema actualiza los saldos de manera
transaccional.

## 12. Seleccionar mensualidades y pagos parciales

1. Selecciona primero la mensualidad más antigua con saldo.
2. Para cubrir varias, selecciona las mensualidades consecutivas.
3. Solo la última mensualidad seleccionada puede recibir un monto parcial.
4. Verifica el total del pago en el pie del diálogo.
5. Corrige cualquier monto inválido antes de revisar el pago.

No se permiten huecos entre mensualidades ni montos mayores al saldo pendiente.

## 13. Consultar el historial de pagos

1. Abre "Historial de pagos".
2. Busca por folio, cliente, teléfono, lote o venta.
3. Filtra por forma de pago o fechas.
4. Presiona "Ver detalle".

Los números de pago son consecutivos simples, por ejemplo `1`, `2` y
`3`.

## 14. Consultar e imprimir un recibo

1. Abre el detalle de un pago.
2. Presiona "Ver recibo" o "Imprimir recibo".
3. Revisa cliente, folio, forma de pago, aplicaciones y saldos históricos.
4. Presiona "Imprimir" desde la vista del recibo.

La impresión está diseñada para mostrar solamente el recibo, sin sidebar,
navegación ni botones de la aplicación.

## 15. Consultar el reporte general

1. Abre "Reporte general".
2. Captura la fecha inicial y final.
3. Presiona "Consultar".
4. Revisa ventas, lotes, importes, pagos posteriores, saldo y resumen por manzana.
5. Usa "Limpiar" para restablecer el periodo.
6. Usa "Imprimir" para imprimir únicamente el reporte.

## 16. Cerrar sesión

1. Abre el menú lateral si está contraído.
2. Presiona "Cerrar sesión".

## Avisos importantes

- Verifica el cliente y los lotes antes de confirmar una venta.
- Verifica precios, enganches y mensualidades antes de confirmar.
- Verifica el resumen antes de confirmar un pago.
- No existen vencimientos, mora, intereses ni recargos en el flujo actual.
