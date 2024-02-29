import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Row,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Dropdown,
  Button,
} from '@carbon/react';
import { usePreAppointments, getWeeksInYear, getCurrentWeek } from './pre-appointment.resource';
import {
  ConfigurableLink,
  isDesktop,
  useLayoutType,
  useLocations,
  usePagination,
  useSession,
} from '@openmrs/esm-framework';
import { ErrorState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { CustomPagination } from '../custom-pagination.component';
import styles from './pre-appointment.scss';

// Define the type of each row in the table
interface TableRow {
  id: string;
  ccc_number: string;
  person_name: string;
  ovcid_id: string;
  upi_number: string;
  program: string;
  predicted_risk: string;
  predicted_prob_disengage: string;
  prediction_generated_date: string;
  sms_delivery_status: string;
  rtc_date: string;
  follow_up_type: string;
  follow_up_reason: string;
  rescheduled_date: string;
  contact_reached: string;
  attempted_home_visit: string;
  reason_not_attempted_home_visit: string;
  was_client_found: string;
  comments: string;
  reason_client_not_found: string;
  was_follow_up_successful: boolean;
  number_of_failed_phone_attempts: string;
  gender: string;
  identifiers: string;
  phone_number: string;
  latest_rtc_date: string;
  latest_vl: number;
  vl_category: string;
  latest_vl_date: string;
  last_appointment: string;
  cur_meds: string;
  nearest_center: string;
  covid_19_vaccination_status: string;
  age: number;
  uuid: string;
}

type Values<T> = T[keyof T];
type PreAppointmentProps = {};

const Status = {
  ALL: '',
  SUCCESSFULL_FOLLOW_UP: '&successfulOutcome=1',
  FAILED_OUTCOME: '&failedOutcome=1',
  UNKNOWN_OUTCOME: '&unknownOutcome=1',
} as const;

const PAGE_SIZE = 10;

// Should be provided by report filter controls
const testProps = {
  locationUuid: { id: '08feb8ae-1352-11df-a1f1-0026b9348838', text: 'MTRH' },
  yearWeek: { id: '2024-W07', text: 'Current week we are in' },
  appointmentSuccess: { id: '0', text: 'All' },
};

export const PreAppointment: React.FC<PreAppointmentProps> = () => {
  // const locations = useLocations();
  // const [locationUuid, setLocationUuid] = useState('08feb8ae-1352-11df-a1f1-0026b9348838');
  const [week, setWeek] = useState('2024-W09');
  const [statusFilter, setStatusFilter] = useState('0');
  // const [preappointmentsData, setPreappointmentsData] = useState([]);
  const [isLoadingStatus, setIsLoadingstatus] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  // const { preappointments, isLoading, error } = usePreAppointments(locationUuid, week, statusFilter);
  // const fetchData = () => {
  //   try {
  //     const { preappointments, isLoading, error, url } = usePreAppointments(locationUuid, week, statusFilter);
  //     if (preappointments) {
  //       setPreappointmentsData(preappointments);
  //       setIsLoadingstatus(false);
  //       setErrorStatus(error);
  //     }
  //   } catch (error) {
  //     console.log('>>>>>>>>>>>>>>>>>>', error);

  //     setIsLoadingstatus(false);
  //     setErrorStatus(error);
  //   }
  // };
  // const { preappointments, isLoading, error } = usePreAppointments(locationUuid, week, statusFilter);

  // fetchData();
  // useEffect(() => {
  //   // console.log('****************');
  //   // const { preappointments, isLoading, error, url } =  usePreAppointments(locationUuid, week, statusFilter);
  //   // console.log(url);
  //   fetchData();
  //   console.log('hggyugyugyugyuf');
  // }, []);

  const handleSubmitFilters = () => {
    // console.log(locationUuid, week, statusFilter);
    // fetchData();
  };

  const { t } = useTranslation();
  const session = useSession();
  const layout = useLayoutType();
  const responsiveSize = isDesktop ? 'sm' : 'lg';

  const statuses: Array<{ id: string; text: string; value: Values<typeof Status> }> = [
    { id: 'all', text: 'All', value: Status.ALL },
    { id: 'successful-followup', text: 'Successful followup', value: Status.SUCCESSFULL_FOLLOW_UP },
    { id: 'failed-followup', text: 'Failed followup attempt', value: Status.FAILED_OUTCOME },
    { id: 'followup-not-attempted', text: 'Followup not attempted', value: Status.UNKNOWN_OUTCOME },
  ];

  const weeks = getWeeksInYear();
  const pageSize = 5;
  const locations = useLocations('Login Location');
  const initialLocation = locations?.find((location) => location.uuid === loggedInLocation)?.display;
  const loggedInLocation = session?.sessionLocation?.uuid ?? '';
  const [locationUuid, setLocationUuid] = useState(loggedInLocation);
  const [selectedWeek, setSelectedWeek] = useState(weeks.pop());
  const [status, setStatus] = useState(Status.ALL);

  const { preAppointments, isLoading, error } = usePreAppointments(locationUuid, selectedWeek, status);
  const { paginated, goTo, results, currentPage } = usePagination(preAppointments, pageSize);
  const { pageSizes } = usePaginationInfo(PAGE_SIZE, preAppointments.length, currentPage, results.length);

  const headers = [
    { key: 'ccc_number', header: 'CCC number' },
    { key: 'person_name', header: 'Person name' },
    { key: 'upi_number', header: 'NUPI number' },
    { key: 'gender', header: 'Gender' },
    { key: 'age', header: 'Age' },
    { key: 'identifiers', header: 'Identifiers' },
    { key: 'program', header: 'Program' },
    { key: 'phone_number', header: 'Phone number' },
    { key: 'predicted_risk', header: 'Predicted risk' },
    { key: 'predicted_prob_disengage', header: 'Predicted Score (%)' },
    { key: 'prediction_generated_date', header: 'Prediction generation date' },
    { key: 'last_appointment', header: 'Latest appointment' },
    { key: 'rtc_date', header: 'RTC date' },
    { key: 'latest_rtc_date', header: 'Latest RTC date' },
    { key: 'cur_meds', header: 'Current regimen' },
    { key: 'latest_vl', header: 'Latest VL' },
    { key: 'latest_vl_date', header: 'Latest VL date' },
    { key: 'vl_category', header: 'VL category' },
    { key: 'follow_up_type', header: 'Follow-up type' },
    { key: 'follow_up_reason', header: 'Follow-up reason' },
    { key: 'was_follow_up_successful', header: 'Follow-up success' },
    { key: 'rescheduled_date', header: 'Rescheduled date' },
    { key: 'number_of_failed_phone_attempts', header: 'No. of failed phone attempts' },
    { key: 'comments', header: 'Comments' },
    { key: 'sms_delivery_status', header: 'SMS outcome' },
    { key: 'contact_reached', header: 'Contact reached' },
    { key: 'attempted_home_visit', header: 'Attempted home visit' },
    { key: 'reason_not_attempted_home_visit', header: 'Reason home visit was not attempted' },
    { key: 'was_client_found', header: 'Client found' },
    { key: 'reason_client_not_found', header: 'Reason client not found' },
    { key: 'nearest_center', header: 'Nearest center' },
    { key: 'covid_19_vaccination_status', header: 'COVID-19 vaccination status' },
  ];

  const tableRows = useMemo(() => {
    return results.map((row: any) => ({
      ...row,
      id: row.person_id,
      person_name: row.person_name ?? '--',
    }));
  }, [results]);

  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={5}
        compact={isDesktop(layout)}
        role="progressbar"
        rowCount={pageSize}
        showHeader={false}
        showToolbar={false}
        zebra
      />
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('preAppointments', 'Pre-Appointments')} />;
  }

  return (
    <>
      <div className={styles.flexContainer}>
        <div className={styles.filterContainer}>
          <Dropdown
            aria-label="Filter by week"
            className={styles.weekFilter}
            initialSelectedItem={getCurrentWeek()}
            items={weeks}
            itemToString={(item) => (item ? item.text : '')}
            label="Select a week"
            onChange={({ selectedItem }) => setSelectedWeek(selectedItem)}
            selectedItem={selectedWeek}
            titleText="Filter by week:"
            type="inline"
          />

          <Dropdown
            aria-label="Filter by status"
            className={styles.statusFilter}
            initialSelectedItem={statuses[0]}
            items={statuses}
            itemToString={(item) => (item ? item.text : '')}
            label="Select a status"
            onChange={({ selectedItem }) => setStatus(selectedItem)}
            selectedItem={status}
            titleText="Filter by status:"
            type="inline"
          />
        </div>
        <div className={styles.headerContainer}>
          <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
            <h4>{t('preAppointments', 'Pre-appointments')}</h4>
          </div>
        </div>
      </div>
      <DataTable rows={tableRows} headers={headers} size={responsiveSize} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
          <>
            <TableContainer className={styles.tableContainer} {...getTableContainerProps()}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/Patient%20Summary';
                    const currentAppointment = tableRows.find((p) => p.id === row.id);

                    if (!currentAppointment) {
                      return null;
                    }

                    return (
                      <React.Fragment key={index}>
                        <TableRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id} data-testid={cell.id}>
                              {cell.info.header === 'person_name' && currentAppointment.uuid ? (
                                <ConfigurableLink
                                  to={patientChartUrl}
                                  templateParams={{ patientUuid: currentAppointment.uuid }}>
                                  {cell.value}
                                </ConfigurableLink>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {tableRows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t('noMatchingRecordsToDisplay', 'No matching records to display')}
                    </p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </>
        )}
      </DataTable>
      {paginated && (
        <CustomPagination
          currentItems={results.length}
          totalItems={preAppointments.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={pageSize}
        />
      )}
    </>
  );
};
