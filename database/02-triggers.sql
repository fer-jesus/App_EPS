-- Trigger para el registro general 
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

DELIMITER ;