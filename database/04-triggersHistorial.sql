DELIMITER $$

-- =======================
-- TRIGGERS PARA TABLA TASAS
-- =======================
DROP TRIGGER IF EXISTS after_insert_tasas$$
CREATE TRIGGER after_insert_tasas
AFTER INSERT ON TASAS
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_TASAS (
    HISTORIAL_CAMBIOS_id_cambios, TASAS_id_tasa, fecha_emisionT, direccion_propiedad,
    alineacion_urban, anotaciones, cant_dem_movTierra, presupuesto_obra,
    cantidad_cancelar, tipo_cambio, latitud, longitud
  )
  VALUES (
    new_cambio_id, NEW.id_tasa, NEW.fecha_emisionT, NEW.direccion_propiedad,
    NEW.alineacion_urban, NEW.anotaciones, NEW.cant_dem_movTierra, NEW.presupuesto_obra,
    NEW.cantidad_cancelar, 'CREACION', NEW.latitud, NEW.longitud
  );
END$$

DROP TRIGGER IF EXISTS after_update_tasas$$
CREATE TRIGGER after_update_tasas
AFTER UPDATE ON TASAS
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_TASAS (
    HISTORIAL_CAMBIOS_id_cambios, TASAS_id_tasa, fecha_emisionT, direccion_propiedad,
    alineacion_urban, anotaciones, cant_dem_movTierra, presupuesto_obra,
    cantidad_cancelar, tipo_cambio, latitud, longitud
  )
  VALUES (
    new_cambio_id, NEW.id_tasa, NEW.fecha_emisionT, NEW.direccion_propiedad,
    NEW.alineacion_urban, NEW.anotaciones, NEW.cant_dem_movTierra, NEW.presupuesto_obra,
    NEW.cantidad_cancelar, 'EDICION',  NEW.latitud, NEW.longitud
  );
END$$

DROP TRIGGER IF EXISTS before_delete_tasas$$
CREATE TRIGGER before_delete_tasas
BEFORE DELETE ON TASAS
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_TASAS (
    HISTORIAL_CAMBIOS_id_cambios, TASAS_id_tasa, fecha_emisionT, direccion_propiedad,
    alineacion_urban, anotaciones, cant_dem_movTierra, presupuesto_obra,
    cantidad_cancelar, tipo_cambio, latitud, longitud
  )
  VALUES (
    new_cambio_id, OLD.id_tasa, OLD.fecha_emisionT, OLD.direccion_propiedad,
    OLD.alineacion_urban, OLD.anotaciones, OLD.cant_dem_movTierra, OLD.presupuesto_obra,
    OLD.cantidad_cancelar, 'ELIMINACION', OLD.latitud, OLD.longitud
  );
END$$

-- ==============================
-- TRIGGERS PARA TABLA TASAS_TARIFA
-- ==============================

DROP TRIGGER IF EXISTS after_insert_tasas_tarifa$$
CREATE TRIGGER after_insert_tasas_tarifa
AFTER INSERT ON TASAS_TARIFA
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_TASAS_TARIFA (
    HISTORIAL_CAMBIOS_id_cambios, TASAS_TARIFA_TASAS_id_tasa,
    TASAS_TARIFA_tarifa_correlativo, TASAS_TARIFA_TARIFA_id_nombreTarifa,
    dimension_construccion, formula, valor
  )
  VALUES (
    new_cambio_id, NEW.TASAS_id_tasa, NEW.tarifa_correlativo, NEW.TARIFA_id_nombreTarifa,
    NEW.dimension_construccion, NEW.formula, NEW.valor
  );
END$$

DROP TRIGGER IF EXISTS after_update_tasas_tarifa$$
CREATE TRIGGER after_update_tasas_tarifa
AFTER UPDATE ON TASAS_TARIFA
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_TASAS_TARIFA (
    HISTORIAL_CAMBIOS_id_cambios, TASAS_TARIFA_TASAS_id_tasa,
    TASAS_TARIFA_tarifa_correlativo, TASAS_TARIFA_TARIFA_id_nombreTarifa,
    dimension_construccion, formula, valor
  )
  VALUES (
    new_cambio_id, NEW.TASAS_id_tasa, NEW.tarifa_correlativo, NEW.TARIFA_id_nombreTarifa,
    NEW.dimension_construccion, NEW.formula, NEW.valor
  );
END$$

DROP TRIGGER IF EXISTS before_delete_tasas_tarifa$$
CREATE TRIGGER before_delete_tasas_tarifa
BEFORE DELETE ON TASAS_TARIFA
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_TASAS_TARIFA (
    HISTORIAL_CAMBIOS_id_cambios, TASAS_TARIFA_TASAS_id_tasa,
    TASAS_TARIFA_tarifa_correlativo, TASAS_TARIFA_TARIFA_id_nombreTarifa,
    dimension_construccion, formula, valor
  )
  VALUES (
    new_cambio_id, OLD.TASAS_id_tasa, OLD.tarifa_correlativo, OLD.TARIFA_id_nombreTarifa,
    OLD.dimension_construccion, OLD.formula, OLD.valor
  );
END$$

-- ==========================
-- TRIGGERS PARA TABLA LICENCIAS
-- ==========================

DROP TRIGGER IF EXISTS after_insert_licencias$$
CREATE TRIGGER after_insert_licencias
AFTER INSERT ON LICENCIAS
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_LICENCIAS (
    LICENCIAS_id_licencia, LICENCIAS_fecha_emisionL, HISTORIAL_CAMBIOS_id_cambios,
    fecha_vencimiento, estado, rotulo
  )
  VALUES (
    NEW.id_licencia, NEW.fecha_emisionL, new_cambio_id,
    NEW.fecha_vencimiento, NEW.estado, NEW.rotulo
  );
END$$

DROP TRIGGER IF EXISTS after_update_licencias$$
CREATE TRIGGER after_update_licencias
AFTER UPDATE ON LICENCIAS
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_LICENCIAS (
    LICENCIAS_id_licencia, LICENCIAS_fecha_emisionL, HISTORIAL_CAMBIOS_id_cambios,
    fecha_vencimiento, estado, rotulo
  )
  VALUES (
    NEW.id_licencia, NEW.fecha_emisionL, new_cambio_id,
    NEW.fecha_vencimiento, NEW.estado, NEW.rotulo
  );
END$$

DROP TRIGGER IF EXISTS before_delete_licencias$$
CREATE TRIGGER before_delete_licencias
BEFORE DELETE ON LICENCIAS
FOR EACH ROW
BEGIN
  DECLARE new_cambio_id INT;

  INSERT INTO HISTORIAL_CAMBIOS (fecha_hora, USUARIOS_id_usuario)
  VALUES (NOW(), @usuario_id);

  SET new_cambio_id = LAST_INSERT_ID();

  INSERT INTO HISTORIAL_LICENCIAS (
    LICENCIAS_id_licencia, LICENCIAS_fecha_emisionL, HISTORIAL_CAMBIOS_id_cambios,
    fecha_vencimiento, estado, rotulo
  )
  VALUES (
    OLD.id_licencia, OLD.fecha_emisionL, new_cambio_id,
    OLD.fecha_vencimiento, OLD.estado, OLD.rotulo
  );
END$$

DELIMITER ;