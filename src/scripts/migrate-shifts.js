// scripts/migrate-shifts.js
// Ejecutar con: node scripts/migrate-shifts.js
//
// ⚠️  IMPORTANTE:
//  - Hacer BACKUP de la colección antes de ejecutar en producción
//  - Probar primero en un entorno de staging o Atlas dev
//  - El script usa .save() → dispara validaciones del modelo
//    (si una excursión no cumple las reglas de negocio, falla y avisa)
require('dotenv').config();
const mongoose = require('mongoose');
// ✅ CORRECTO (desde src/scripts/ → src/models/)
const Excursion = require('../models/excursion.model');

// ============================================================
// PLAN DE MIGRACIÓN
// ============================================================
const MIGRATION_PLAN = [
    // ============================================================
    // FULL DAY → single shift, morning
    // ============================================================
    {
        id: '6af10817d53213eab11e0861',
        name: 'Saona Island: A Paradise You Must Discover',
        hasMultipleShifts: false,
        availableShifts: ['morning']
    },
    {
        id: '6af10fecd53213eab11e08a4',
        name: 'Catalina Island: A Unique Experience',
        hasMultipleShifts: false,
        availableShifts: ['morning']
    },
    {
        id: '6af11952d53213eab11e0933',
        name: 'Los Haitises and Montana Redonda Adventure',
        hasMultipleShifts: false,
        availableShifts: ['morning']
    },
    {
        id: '6af12e2ad53213eab11e0af8',
        name: 'Samana Adventure: El Limon Waterfall and Cayo Levantado',
        hasMultipleShifts: false,
        availableShifts: ['morning']
    },

    // ============================================================
    // DOUBLE SHIFT → morning + afternoon
    // ============================================================
    {
        id: '6af114afd53213eab11e08f8',
        name: 'Buggy Adventure: Cenote and Organic Farm',
        hasMultipleShifts: true,
        availableShifts: ['morning', 'afternoon']
    },
    {
        id: '6af11d83d53213eab11e0994',
        name: 'Monkey Land Family Adventure',
        hasMultipleShifts: true,
        availableShifts: ['morning', 'afternoon']
    },

    // ============================================================
    // NIGHT ONLY → single shift, night
    // ============================================================
    {
        id: '6af1218dd53213eab11e0a03',
        name: 'Unique Night in Buggy Adventure',
        hasMultipleShifts: false,
        availableShifts: ['night']
    },
    {
        id: '6af1284cd53213eab11e0a6c',
        name: 'Coco Bongo Night Show Punta Cana',
        hasMultipleShifts: false,
        availableShifts: ['night']
    }
];

// ============================================================
// SCRIPT
// ============================================================
(async () => {
    const startTime = Date.now();
    console.log('\n🚀 Starting shifts migration...\n');
    console.log(`📦 Total excursions to migrate: ${MIGRATION_PLAN.length}\n`);

    try {
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
        console.log('='.repeat(70));

        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (const plan of MIGRATION_PLAN) {
            console.log(`\n🔍 Processing: ${plan.name}`);
            console.log(`   _id: ${plan.id}`);

            try {
                const excursion = await Excursion.findById(plan.id);

                if (!excursion) {
                    console.warn(`   ⚠️  NOT FOUND — skipping`);
                    skipped++;
                    continue;
                }

                // Sanity check: name match (evita migrar el _id equivocado)
                if (excursion.name !== plan.name) {
                    console.warn(`   ⚠️  NAME MISMATCH — skipping`);
                    console.warn(`      Expected: "${plan.name}"`);
                    console.warn(`      Found   : "${excursion.name}"`);
                    errors.push({
                        id: plan.id,
                        name: plan.name,
                        issue: 'Name mismatch',
                        found: excursion.name
                    });
                    continue;
                }

                // Estado previo (para log)
                const before = {
                    hasMultipleShifts: excursion.shifts?.hasMultipleShifts ?? null,
                    availableShifts: excursion.shifts?.availableShifts ?? null,
                    duration: `${excursion.duration?.value} ${excursion.duration?.unit}`
                };

                // Aplicar cambios
                excursion.shifts = {
                    hasMultipleShifts: plan.hasMultipleShifts,
                    availableShifts: plan.availableShifts
                };

                // Guardar → dispara pre('validate') y valida reglas de negocio
                await excursion.save();

                // Estado posterior
                const after = {
                    hasMultipleShifts: excursion.shifts.hasMultipleShifts,
                    availableShifts: excursion.shifts.availableShifts
                };

                console.log(`   ✅ UPDATED`);
                console.log(`   ┌─ BEFORE`);
                console.log(`   │    hasMultipleShifts: ${before.hasMultipleShifts}`);
                console.log(`   │    availableShifts  : ${JSON.stringify(before.availableShifts)}`);
                console.log(`   │    duration         : ${before.duration}`);
                console.log(`   └─ AFTER`);
                console.log(`        hasMultipleShifts: ${after.hasMultipleShifts}`);
                console.log(`        availableShifts  : ${JSON.stringify(after.availableShifts)}`);

                updated++;
            } catch (err) {
                // Aquí caen errores de validación del modelo
                // (ej. multi-turno con duration >= 6h, array inválido, etc.)
                console.error(`   ❌ FAILED: ${err.message}`);
                errors.push({
                    id: plan.id,
                    name: plan.name,
                    issue: err.name || 'Error',
                    message: err.message
                });
            }
        }

        // ============================================================
        // RESUMEN FINAL
        // ============================================================
        console.log('\n' + '='.repeat(70));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(70));
        console.log(`✅ Updated : ${updated}`);
        console.log(`⏭️  Skipped : ${skipped}`);
        console.log(`❌ Errors  : ${errors.length}`);
        console.log(`⏱️  Time    : ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

        if (errors.length > 0) {
            console.log('\n⚠️  ERRORS DETAIL:');
            console.table(errors);
            process.exitCode = 1;
        } else {
            console.log('\n🎉 All migrations completed successfully!');
        }
        console.log('='.repeat(70) + '\n');

    } catch (err) {
        console.error('\n💥 FATAL ERROR:', err.message);
        console.error(err.stack);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB\n');
    }
})();