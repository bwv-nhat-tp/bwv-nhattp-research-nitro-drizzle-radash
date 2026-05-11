import { db } from './db';
import { customers, orders } from './schema';
import { draw, random } from 'radash';

async function runSeed() {
  const positions = [
    { id: 0, prefix: 'admin' },
    { id: 1, prefix: 'group_admin' },
    { id: 2, prefix: 'user' },
  ];
  const jpFamilyNames = ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤'];
  const jpGivenNames = ['太郎', '次郎', '健太', '翔太', '大樹', 'さくら', '結衣', '陽菜', '美咲', '葵'];

  const newCustomers = [];
  for (const pos of positions) {
    for (let i = 1; i <= 20; i++) {
      const year = random(2020, 2023);
      const month = String(random(1, 12)).padStart(2, '0');
      const day = String(random(1, 28)).padStart(2, '0');

      newCustomers.push({
        email: `${pos.prefix}${i}@briswell-vn.com`,
        password: '$2y$10$fq6mubuWUcRX0TpGxwuu/O8FVIFi.kmTqQpy7fyFC7gAGsY4BtSDC',
        name: `${draw(jpFamilyNames)} ${draw(jpGivenNames)}`,
        startedDate: `${year}-${month}-${day}`,
        positionId: pos.id,
      });
    }
  }

  await db.insert(customers).values(newCustomers);
  const allCustomers = await db.select({ id: customers.id }).from(customers);
  const validCustomerIds = allCustomers.map(c => c.id);

  if (validCustomerIds.length === 0) return;
  const jpItems = ['パソコン', 'マウス', 'キーボード', 'モニター', 'スマホ', 'タブレット', 'デスク', '椅子', 'イヤホン', 'ケーブル'];
  const customerOrderCounts: Record<number, number> = {};
  for (const id of validCustomerIds) {
    customerOrderCounts[id] = 0;
  }

  const newOrders = [];
  for (let i = 1; i <= 100; i++) {
    let randomCustomerId: number;
    
    let attempts = 0;
    while (attempts < 500) {
      randomCustomerId = draw(validCustomerIds)!;
      if (customerOrderCounts[randomCustomerId] < 5) {
        customerOrderCounts[randomCustomerId]++;
        break;
      }
      attempts++;
    }

    newOrders.push({
      itemName: draw(jpItems)!,
      itemCode: `ORD${String(i).padStart(3, '0')}`,
      itemQuantity: random(1, 5),
      customerId: randomCustomerId!,
    });
  }

  await db.insert(orders).values(newOrders);
  process.exit(0);
}

runSeed().catch(err => {
  process.exit(1);
});