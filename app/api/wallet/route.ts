import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    const body = await request.json();
    const { amount, action } = body; // action is 'deposit' or 'withdraw'

    if (!amount || amount <= 0 || !['deposit', 'withdraw'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    const userRef = adminDb.collection('users').doc(userId);

    await adminDb.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const balance = userDoc.data()?.walletBalance || 0;

      if (action === 'withdraw') {
        if (balance < parsedAmount) {
          throw new Error('Insufficient balance');
        }
        t.update(userRef, {
          walletBalance: admin.firestore.FieldValue.increment(-parsedAmount)
        });
      } else if (action === 'deposit') {
        t.update(userRef, {
          walletBalance: admin.firestore.FieldValue.increment(parsedAmount)
        });
      }

      // Record transaction
      const txRef = adminDb.collection(`users/${userId}/transactions`).doc();
      t.set(txRef, {
        userId,
        type: action,
        amount: parsedAmount,
        status: 'success',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Wallet error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
