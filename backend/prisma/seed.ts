import 'dotenv/config';
import { PrismaClient, type Apartment, type Project, type Tenant } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { addMonths, subMonths, startOfMonth } from 'date-fns';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run prisma seed.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando el sembrado de datos (Seed)...');

  // 1. Borrar datos existentes para evitar duplicados (Orden estricto por FK)
  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.project.deleteMany();

  // 2. Crear Proyectos
  const proyectosData = [
    { name: 'Residencial Miralbueno', address: 'Av. Camino del Pilón 45, Zaragoza' },
    { name: 'Torres del Actur', address: 'Calle María de Maeztu 12, Zaragoza' },
    { name: 'Condominio Centro', address: 'Calle Alfonso I 8, Zaragoza' },
  ];

  const proyectos: Project[] = [];
  for (const p of proyectosData) {
    const proj = await prisma.project.create({ data: p });
    proyectos.push(proj);
  }
  console.log(`${proyectos.length} Proyectos creados.`);

  // 3. Crear Apartamentos (15 por proyecto = 45 total)
  const statusOptions = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
  const apartments: Apartment[] = [];

  for (const proj of proyectos) {
    for (let i = 1; i <= 15; i++) {
      const piso = Math.ceil(i / 4);
      const letra = ['A', 'B', 'C', 'D'][(i - 1) % 4];
      const unitNumber = `${piso}° ${letra}`;
      
      // Distribución de estados artificial pero realista
      let status = 'OCCUPIED';
      if (i === 14) status = 'AVAILABLE';
      if (i === 15) status = 'MAINTENANCE';

      const apt = await prisma.apartment.create({
        data: {
          projectId: proj.id,
          unitNumber,
          sizeM2: parseFloat((65 + Math.random() * 50).toFixed(1)),
          bedrooms: Math.random() > 0.5 ? 3 : 2,
          bathrooms: Math.random() > 0.7 ? 2 : 1,
          monthlyRent: Math.floor(650 + Math.random() * 400),
          status,
        },
      });
      apartments.push(apt);
    }
  }
  console.log(`${apartments.length} Apartamentos creados.`);

  // 4. Crear Inquilinos (40 inquilinos para los departamentos ocupados)
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'David', 'Elena', 'Javier', 'Sofia', 'Diego', 'Lucía', 'Manuel', 'Carmen'];
  const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Ruiz'];

  const tenants: Tenant[] = [];
  for (let i = 0; i < 40; i++) {
    const firstNames = `${nombres[i % nombres.length]} ${Math.random() > 0.6 ? nombres[(i + 1) % nombres.length] : ''}`.trim();
    const lastNames = `${apellidos[i % apellidos.length]} ${apellidos[(i + 2) % apellidos.length]}`;
    
    const tenant = await prisma.tenant.create({
      data: {
        firstNames,
        lastNames,
        email: `${firstNames.toLowerCase().replace(' ', '')}.${i}@rentflow.local`,
        phone: `+34 6${Math.floor(10000000 + Math.random() * 90000000)}`,
      },
    });
    tenants.push(tenant);
  }
  console.log(`${tenants.length} Inquilinos creados.`);

  // 5. Vincular mediante Contratos y generar sus Pagos mensuales
  let totalPayments = 0;
  const occupiedApartments = apartments.filter(a => a.status === 'OCCUPIED');

  for (let i = 0; i < occupiedApartments.length; i++) {
    const apt = occupiedApartments[i];
    const tenant = tenants[i % tenants.length];

    // Contrato que empezó hace 5 meses y dura 1 año
    const startDate = subMonths(startOfMonth(new Date()), 5);
    const endDate = addMonths(startDate, 12);

    const contract = await prisma.contract.create({
      data: {
        apartmentId: apt.id,
        tenantId: tenant.id,
        startDate,
        endDate,
        monthlyRentRate: apt.monthlyRent,
        status: 'ACTIVE',
      },
    });

    // Generar 6 meses de facturas/pagos (5 pasados + el mes actual)
    for (let m = 0; m <= 5; m++) {
      const dueDate = addMonths(startDate, m);
      
      // El mes actual (m=5) o el mes pasado (m=4) pueden estar pendientes o atrasados
      let status = 'PAID';
      let paymentDate: Date | null = addMonths(startDate, m);

      if (m === 5) {
        // Mes actual: 60% probabilidad de pago, 40% pendiente
        const rand = Math.random();
        status = rand > 0.4 ? 'PAID' : 'PENDING';
        paymentDate = status === 'PAID' ? dueDate : null;
      } else if (m === 4 && Math.random() > 0.8) {
        // Mes pasado: Pequeña probabilidad de estar vencido/atrasado
        status = 'OVERDUE';
        paymentDate = null;
      }

      await prisma.payment.create({
        data: {
          contractId: contract.id,
          amount: contract.monthlyRentRate,
          dueDate,
          paymentDate,
          status,
        },
      });
      totalPayments++;
    }
  }

  console.log(`Contratos enlazados y ${totalPayments} registros de pago creados.`);
  console.log('Sembrado de datos completado con éxito de forma relacional.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });