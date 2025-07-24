-- Trigger para el registro general de LICENCIAS
DELIMITER //

CREATE TRIGGER generar_id_licencia_correlativo
BEFORE INSERT ON LICENCIAS
FOR EACH ROW
BEGIN
    DECLARE max_correlativo INT DEFAULT 0;
    DECLARE anio_actual CHAR(4);

    -- Obtener el año de la nueva licencia
    SET anio_actual = YEAR(NEW.fecha_emisionL);

    -- Buscar el máximo correlativo de ese año
    SELECT IFNULL(
        MAX(id_licencia), 0
    ) INTO max_correlativo
    FROM LICENCIAS
    WHERE YEAR(fecha_emisionL) = anio_actual;

    SET NEW.id_licencia = max_correlativo + 1;
END;
//

-- Trigger para el registro general de NOMENCLATURAS
CREATE TRIGGER generar_id_nomenclatura_correlativo
BEFORE INSERT ON NOMENCLATURAS
FOR EACH ROW
BEGIN
    DECLARE max_correlativo INT DEFAULT 0;
    DECLARE anio_actual CHAR(4);

    -- Obtener el año de la nueva nomenclatura
    SET anio_actual = YEAR(NEW.fecha_emisionN);

    -- Buscar el máximo correlativo de ese año
    SELECT IFNULL(MAX(id_nomenclatura), 0)
    INTO max_correlativo
    FROM NOMENCLATURAS
    WHERE YEAR(fecha_emisionN) = anio_actual;

    -- Asignar el siguiente ID
    SET NEW.id_nomenclatura = max_correlativo + 1;
END;
//

DELIMITER ;