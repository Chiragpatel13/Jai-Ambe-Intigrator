import mongoose from 'mongoose';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const prods = await mongoose.connection.db.collection('products').find({
    name: {
      $in: [
        /Schneider Electric Easy9 63A 4-Pole 30mA RCCB/i,
        /Finolex 4 Sq.mm Industrial Multi-Strand Copper Wire/i,
        /Siemens 3TF30 3-Pole 9A Power Contactor/i
      ]
    }
  }).toArray();

  for (const p of prods) {
    console.log(`Product: ${p.name}`);
    console.log(`Images:`, p.images);
  }
  await mongoose.disconnect();
}

check();
