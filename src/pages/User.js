import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import axios from 'axios';
// material
import {
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  AppCurrentVisits,
  AppWidgetSummary,
} from '../sections/@dashboard/app';
import { fDate } from '../utils/formatTime';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead} from '../sections/@dashboard/user';


// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Nome', alignRight: false },
  { id: 'perfil', label: 'Perfil', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'atualizado', label: 'Atualizado', alignRight: false }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function User() {

  const theme = useTheme();

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dados, setdados] = useState([]);
 
  useEffect(() => {
    axios
      .get("https://apiteste.medfy.com.br/dash/prestadores?size=15&perfil_id=0&perfil_cod",{
        headers: {
          'Authorization': `Bearer bd4148f4067a9f87c3870d418672618b`
        }
      })
      .then((response) => {
        
        const prestadores = response.data.LISTA
        setdados(prestadores)
      })
      .catch((err) => {
        console.error(`Ops! ocorreu um erro + ${err}`);
      });
      
  },[]);

  const [totalprestadores = 0, settotalprestadores] = useState ();

  const [rankprofissionais, setrankprofissionais] = useState ([]);

  useEffect(() => {
    axios
      .get("https://apiteste.medfy.com.br/dash/perfil",{
        headers: {
          'Authorization': `Bearer bd4148f4067a9f87c3870d418672618b`
        }
      })
      .then((response) => {
        console.log(response.data.RANK)
        settotalprestadores(response.data.TOTAL)
        setrankprofissionais(response.data.RANK)
        console.log(rankprofissionais)
      })
      .catch((err) => {
        console.error(`Ops! ocorreu um erro + ${err}`);
      });
      
  },[]);

  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - dados.length) : 0;

  const filteredUsers = applySortFilter(dados, getComparator(order, orderBy), filterName);

  

  return (
    <Page title="Corpo Clinico">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Corpo clinico
        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={12} md={6} lg={8}>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 600 }}>                
              <Table>
                <UserListHead
                  headLabel={TABLE_HEAD}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {

                    return (
                      <TableRow
                        hover
                        key={row.codigo}
                        tabIndex={-1}
                      >                        
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={row.pr_nome_cracha} src={row.foto} />
                            <Typography variant="subtitle2" noWrap>
                              {row.pr_nome_cracha}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{row.perfil_desc}</TableCell>                        
                        <TableCell align="left">
                          <Label variant="ghost" color={(row.status === 'banned' && 'error') || 'success'}>
                            {sentenceCase(row.status === 'A' ? "Ativo" : "Inativo")}
                          </Label>
                        </TableCell>
                        <TableCell align="left">{fDate(row.dt_aprovacao)}</TableCell>

                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[10, 15, 25]}
            component="div"
            count={dados.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppWidgetSummary title="Prestadores" total={totalprestadores} color="info" icon={'ant-design:apple-filled'} />
            <br/>
            <AppCurrentVisits
                chartData={[                  
                  { label: 'Medicos', value: 1633 },
                  { label: 'Instrumentadores', value: 142 },
                  { label: 'Psicologos', value: 15 },
                  { label: 'Nutricionistas', value: 48 },
                ]}                         
              
              chartColors={[
                theme.palette.primary.main,
                theme.palette.chart.blue[0],
                theme.palette.chart.yellow[0],
                theme.palette.chart.violet[0],
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
