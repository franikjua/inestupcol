import React, { useContext, useMemo } from 'react';
import Title1 from '../../utils/Title1';
import AcademicAccreditation from './AcademicAccreditation';
import AcademicPrograms from './AcademicPrograms';
import AcademicData from './AcademicData';
import AcademicStudents from './AcademicStudents';
import AcademicTeaching from './AcademicTeaching';
import SemesterContext from '../../context/SemesterContext';

const Academic = () => {
    const selectedSemester = useContext(SemesterContext) || '2024-2'; // Valor por defecto

    // Memorizar el contenido para evitar renders innecesarios
    const academicContent = useMemo(() => (
        <>
            <Title1>ACADÉMICO   {selectedSemester}</Title1>

            <AcademicAccreditation />
            <AcademicPrograms />
            <AcademicStudents />
            <AcademicData />
            <AcademicTeaching />
        </>
    ), [selectedSemester]);

    return <section>{academicContent}</section>;
};

export default Academic;
