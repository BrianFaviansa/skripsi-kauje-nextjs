import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const faculties = [
  "Ilmu Komputer",
  "MIPA",
  "Pertanian",
  "Teknologi Pertanian",
  "Ilmu Sosial Ilmu Politik",
  "Ilmu Budaya",
  "Ekonomi dan Bisnis",
  "Hukum",
  "KIP",
  "Kedokteran",
  "Kedokteran Gigi",
  "Keperawatan",
  "Kesehatan Masyarakat",
  "Farmasi",
  "Teknik",
];

const majors: Array<{ name: string; faculty: string }> = [
  // Ilmu Komputer
  { name: "Sistem Informasi", faculty: "Ilmu Komputer" },
  { name: "Teknologi Informasi", faculty: "Ilmu Komputer" },
  { name: "Informatika", faculty: "Ilmu Komputer" },

  // MIPA
  { name: "Matematika", faculty: "MIPA" },
  { name: "Fisika", faculty: "MIPA" },
  { name: "Kimia", faculty: "MIPA" },
  { name: "Biologi", faculty: "MIPA" },

  // Pertanian
  { name: "Agribisnis", faculty: "Pertanian" },
  { name: "Agroteknologi", faculty: "Pertanian" },
  { name: "Agronomi", faculty: "Pertanian" },
  { name: "Proteksi Tanaman", faculty: "Pertanian" },
  { name: "Ilmu Tanah", faculty: "Pertanian" },
  { name: "Penyuluhan Pertanian", faculty: "Pertanian" },
  { name: "Peternakan", faculty: "Pertanian" },
  { name: "Ilmu Pertanian", faculty: "Pertanian" },

  // Teknologi Pertanian
  { name: "Teknologi Hasil Pertanian", faculty: "Teknologi Pertanian" },
  { name: "Teknik Pertanian", faculty: "Teknologi Pertanian" },
  { name: "Teknologi Industri Pertanian", faculty: "Teknologi Pertanian" },

  // Ilmu Sosial Ilmu Politik
  { name: "Ilmu Administrasi", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "Administrasi Negara", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "Administrasi Bisnis", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "Kesejahteraan Sosial", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "Hubungan Internasional", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "Sosiologi", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "Perpajakan", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "Usaha Perjalanan Wisata", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "D3 Usaha Perjalanan Wisata", faculty: "Ilmu Sosial Ilmu Politik" },
  { name: "D3 Perpajakan", faculty: "Ilmu Sosial Ilmu Politik" },

  // Ilmu Budaya
  { name: "Sastra Indonesia", faculty: "Ilmu Budaya" },
  { name: "Sastra Inggris", faculty: "Ilmu Budaya" },
  { name: "Ilmu Sejarah", faculty: "Ilmu Budaya" },
  { name: "Film dan Televisi", faculty: "Ilmu Budaya" },

  // Ekonomi dan Bisnis
  { name: "Ekonomi Pembangunan", faculty: "Ekonomi dan Bisnis" },
  { name: "Manajemen", faculty: "Ekonomi dan Bisnis" },
  { name: "Akuntansi", faculty: "Ekonomi dan Bisnis" },
  { name: "Ekonomi Syariah", faculty: "Ekonomi dan Bisnis" },
  { name: "D3 Administrasi Keuangan", faculty: "Ekonomi dan Bisnis" },
  { name: "D3 Kesekretariatan", faculty: "Ekonomi dan Bisnis" },
  { name: "D3 Manajemen Perusahaan", faculty: "Ekonomi dan Bisnis" },
  { name: "D3 Akuntansi", faculty: "Ekonomi dan Bisnis" },

  // Hukum
  { name: "Ilmu Hukum", faculty: "Hukum" },

  // KIP
  { name: "Pendidikan Bahasa dan Sastra Indonesia", faculty: "KIP" },
  { name: "Pendidikan Bahasa Inggris", faculty: "KIP" },
  { name: "Pendidikan Matematika", faculty: "KIP" },
  { name: "Pendidikan Biologi", faculty: "KIP" },
  { name: "Pendidikan Fisika", faculty: "KIP" },
  { name: "Pendidikan Kimia", faculty: "KIP" },
  { name: "Pendidikan Guru Sekolah Dasar", faculty: "KIP" },
  { name: "Pendidikan Jasmani, Kesehatan dan Rekreasi", faculty: "KIP" },
  { name: "Pendidikan Ekonomi", faculty: "KIP" },
  { name: "Pendidikan Geografi", faculty: "KIP" },
  { name: "Pendidikan Sejarah", faculty: "KIP" },
  { name: "Pendidikan Pancasila dan Kewarganegaraan", faculty: "KIP" },
  { name: "Pendidikan Luar Sekolah", faculty: "KIP" },
  { name: "Administrasi Pendidikan", faculty: "KIP" },
  { name: "Program Bimbingan & Konseling", faculty: "KIP" },

  // Kedokteran
  { name: "Pendidikan Dokter", faculty: "Kedokteran" },
  { name: "Profesi Dokter", faculty: "Kedokteran" },

  // Kedokteran Gigi
  { name: "Pendidikan Dokter Gigi", faculty: "Kedokteran Gigi" },
  { name: "Profesi Dokter Gigi", faculty: "Kedokteran Gigi" },

  // Keperawatan
  { name: "Keperawatan", faculty: "Keperawatan" },
  { name: "Profesi Ners", faculty: "Keperawatan" },
  { name: "D3 Keperawatan", faculty: "Keperawatan" },

  // Kesehatan Masyarakat
  { name: "Kesehatan Masyarakat", faculty: "Kesehatan Masyarakat" },
  {
    name: "Profesi Ahli Kesehatan Masyarakat",
    faculty: "Kesehatan Masyarakat",
  },
  { name: "Gizi", faculty: "Kesehatan Masyarakat" },

  // Farmasi
  { name: "Farmasi", faculty: "Farmasi" },
  { name: "Profesi Apoteker", faculty: "Farmasi" },

  // Teknik
  { name: "Teknik Mesin", faculty: "Teknik" },
  { name: "Teknik Elektro", faculty: "Teknik" },
  { name: "Teknik Sipil", faculty: "Teknik" },
  { name: "Perencanaan Wilayah dan Kota", faculty: "Teknik" },
  { name: "Teknik Kimia", faculty: "Teknik" },
  { name: "Teknik Lingkungan", faculty: "Teknik" },
  { name: "Teknik Konstruksi Perkapalan", faculty: "Teknik" },
  { name: "Teknik Pertambangan", faculty: "Teknik" },
  { name: "Teknik Perminyakan", faculty: "Teknik" },
  { name: "D3 Teknik Elektronika", faculty: "Teknik" },
  { name: "D3 Teknik Mesin", faculty: "Teknik" },
  { name: "D3 Teknik Sipil", faculty: "Teknik" },
];

const jobFieldNames = [
  "Teknologi Informasi",
  "Pemasaran Digital",
  "Desain Grafis",
  "Keuangan & Akuntansi",
  "Sumber Daya Manusia (HR)",
  "Pendidikan",
  "Kesehatan",
  "Manufaktur & Teknik",
  "Penjualan & Pengembangan Bisnis",
  "Administrasi & Operasional",
];

const collaborationFieldNames = [
  "Penelitian",
  "Mentoring",
  "Event",
  "Proyek",
  "Webinar",
  "Workshop",
];

async function seedRoles() {
  console.log("Seeding roles...");
  await prisma.role.upsert({
    where: {
      name: "Admin",
    },
    create: {
      name: "Admin",
    },
    update: {},
  });

  await prisma.role.upsert({
    where: {
      name: "Alumni",
    },
    create: {
      name: "Alumni",
    },
    update: {},
  });
  console.log("Roles seeded.");
}

async function seedFaculties() {
  console.log("Seeding faculties...");
  for (const faculty of faculties) {
    await prisma.faculty.upsert({
      where: {
        name: faculty,
      },
      create: {
        name: faculty,
      },
      update: {},
    });
  }
  console.log("Faculties seeded.");
}

async function seedMajors() {
  console.log("Seeding majors...");
  const faculties = await prisma.faculty.findMany({
    select: { id: true, name: true },
  });
  const fMap = new Map(faculties.map((f: any) => [f.name, f.id] as const));

  for (const major of majors) {
    if (fMap.has(major.faculty)) {
      await prisma.major.upsert({
        where: {
          name: major.name,
        },
        create: {
          name: major.name,
          facultyId: fMap.get(major.faculty)!,
        },
        update: {
          facultyId: fMap.get(major.faculty)!,
        },
      });
    }
  }
  console.log("Majors seeded.");
}

async function seedJobFields() {
  console.log("Seeding job fields...");
  for (const jobField of jobFieldNames) {
    await prisma.jobField.upsert({
      where: {
        name: jobField,
      },
      create: {
        name: jobField,
      },
      update: {},
    });
  }
  console.log("Job fields seeded.");
}

async function seedCollaborationFields() {
  console.log("Seeding collaboration fields...");
  for (const collaborationField of collaborationFieldNames) {
    await prisma.collaborationField.upsert({
      where: {
        name: collaborationField,
      },
      create: {
        name: collaborationField,
      },
      update: {},
    });
  }
  console.log("Collaboration fields seeded.");
}

async function seedProvincesAndCities() {
  console.log("Seeding provinces and cities...");
  try {
    const provinceRes = await fetch("https://wilayah.id/api/provinces.json");
    if (!provinceRes.ok) {
      throw new Error(`Failed to fetch provinces: ${provinceRes.status}`);
    }
    const provinceJson = await provinceRes.json();
    const provinces = provinceJson.data;

    console.log(`📊 Found ${provinces.length} provinces to process`);

    for (let i = 0; i < provinces.length; i++) {
      const province = provinces[i];
      console.log(
        `🏛️ Processing province ${i + 1}/${provinces.length}: ${province.name}`
      );

      try {
        // Upsert Province using NAME as we don't have 'code' in schema
        const createdProvince = await prisma.province.upsert({
          where: { name: province.name }, // Assuming name is unique as per schema
          update: {},
          create: {
            name: province.name,
          },
        });

        console.log(`✅ Province ${province.name} upserted`);

        let regencyJson;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            console.log(
              `📡 Fetching cities for ${province.name} (attempt ${
                retryCount + 1
              })`
            );
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            // Fetch regencies/cities using the API's 'code' which is available in the loop but not stored
            const regencyRes = await fetch(
              `https://wilayah.id/api/regencies/${province.code}.json`,
              {
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (!regencyRes.ok) {
              throw new Error(
                `HTTP ${regencyRes.status}: ${regencyRes.statusText}`
              );
            }

            regencyJson = await regencyRes.json();
            break;
          } catch (error) {
            retryCount++;
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.warn(
              `⚠️ Failed to fetch cities for ${province.name} (attempt ${retryCount}):`,
              errorMessage
            );

            if (retryCount >= maxRetries) {
              throw new Error(
                `Failed to fetch cities for ${province.name} after ${maxRetries} attempts`
              );
            }

            await new Promise((r) => setTimeout(r, 2000 * retryCount));
          }
        }

        if (!regencyJson || !regencyJson.data) {
          throw new Error(
            `Invalid response format for cities of ${province.name}`
          );
        }

        const cities = regencyJson.data;
        console.log(`🏙️ Found ${cities.length} cities for ${province.name}`);

        // Process cities in batches
        const batchSize = 10;
        for (let j = 0; j < cities.length; j += batchSize) {
          const batch = cities.slice(j, j + batchSize);

          await Promise.all(
            batch.map(async (r: any) => {
              try {
                // Upsert City using NAME
                await prisma.city.upsert({
                  where: { name: r.name },
                  update: { provinceId: createdProvince.id },
                  create: {
                    name: r.name,
                    provinceId: createdProvince.id,
                  },
                });
              } catch (error) {
                console.error(`❌ Failed to upsert city ${r.name}:`, error);
                throw error;
              }
            })
          );

          console.log(
            `✅ Processed cities ${j + 1}-${Math.min(
              j + batchSize,
              cities.length
            )} for ${province.name}`
          );
        }

        console.log(`✅ ${province.name} completed (${cities.length} cities)`);
      } catch (error) {
        console.error(`❌ Failed to process province ${province.name}:`, error);
        throw error;
      }

      if (i < provinces.length - 1) {
        console.log(`⏳ Waiting 500ms before next province...`);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const finalProvinceCount = await prisma.province.count();
    const finalCityCount = await prisma.city.count();

    console.log(`🎉 Provinces and cities seeded successfully!`);
    console.log(
      `📊 Final counts: ${finalProvinceCount} provinces, ${finalCityCount} cities`
    );
  } catch (error) {
    console.error("❌ Critical error in seedProvincesAndCities:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting database seeding...");
  try {
    await seedRoles();
    await seedFaculties();
    await seedMajors();
    await seedJobFields();
    await seedCollaborationFields();
    await seedProvincesAndCities();
    console.log("✨ Seeding process completed successfully.");
  } catch (e) {
    console.error("💥 Seeding failed:");
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
