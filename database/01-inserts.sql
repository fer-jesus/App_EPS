INSERT INTO ROL (id_rol) VALUES 
(1), -- DIRECTOR
(2), -- SUBDIRECTOR
(3), -- COORDINADOR
(4); -- COORDINADORA INTERINA

INSERT INTO ROL_NOMBRE (ROL_id_rol, sexo, nombre_rol) VALUES
(1, 'M', 'DIRECTOR'),
(1, 'F', 'DIRECTORA'),
(2, 'M', 'SUBDIRECTOR'),
(2, 'F', 'SUBDIRECTORA'),
(3, 'M', 'COORDINADOR'),
(3, 'F', 'COORDINADORA'),
(4, 'M', 'COORDINADOR INTERINO'),
(4, 'F', 'COORDINADORA INTERINA');

INSERT INTO USUARIOS (
  nombre, titulo, fecha_nacimiento, correo, contrasena,  
  fecha_registro, unidad, en_funciones, sexo, ROL_id_rol
) VALUES (
  'Jonatan Douglas Argueta Salazar', 'Ing.', '1990-01-01', 'jonatan.argueta7777@outlook.es', 
  '1234',  
  NOW(),  
  'DIRECCION DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL', 
  1, 'M', 1  -- ROL_id_rol = 1 (DIRECTOR)
);