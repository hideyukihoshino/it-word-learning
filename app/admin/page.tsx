'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { addTermToFirestore } from '@/lib/terms-firestore'
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/terms'

// カテゴリの型エイリアス
type Category = typeof CATEGORIES[number]

// 初期フォーム状態（categoryはCategoryユニオン型として明示）
const initialForm: {
  term: string
  reading: string
  category: Category
  description: string
  awsExam: boolean
  examPoint: string
} = {
  term: '',
  reading: '',
  category: CATEGORIES[0],
  description: '',
  awsExam: false,
  examPoint: '',
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signInError, setSignInError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // 認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // メール・パスワードでサインイン
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setSignInError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setSignInError('メールアドレスまたはパスワードが違います')
      } else {
        setSignInError(code || '不明なエラー')
      }
    }
  }

  async function handleSignOut() {
    await signOut(auth)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.term.trim() || !form.description.trim()) return

    setStatus('saving')
    setErrorMsg('')

    try {
      await addTermToFirestore({
        term: form.term.trim(),
        reading: form.reading.trim() || undefined,
        category: form.category,
        description: form.description.trim(),
        awsExam: form.awsExam,
        examPoint: form.awsExam && form.examPoint.trim() ? form.examPoint.trim() : undefined,
      })
      setStatus('success')
      setForm(initialForm)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存に失敗しました。'
      console.error(err)
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '6px',
    fontWeight: '500',
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>読み込み中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>📖 用語を追加する</h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '32px' }}>サインインしてください</p>
        <form onSubmit={handleSignIn} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#111', fontSize: '16px', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            required
            style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#111', fontSize: '16px', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          />
          <button
            type="submit"
            style={{ padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            サインイン
          </button>
          {signInError && (
            <p style={{ fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>⚠️ {signInError}</p>
          )}
        </form>
        <Link href="/" style={{ marginTop: '24px', fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>← 戻る</Link>
      </div>
    )
  }

  const selectedCategoryColor = CATEGORY_COLORS[form.category]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{
          maxWidth: '640px', margin: '0 auto', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ fontSize: '16px', color: '#6b7280', textDecoration: 'none' }}>← 戻る</Link>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>📖 用語を追加する</h1>
          </div>
          <button
            onClick={handleSignOut}
            style={{ fontSize: '12px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            サインアウト
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            border: '1px solid #e5e7eb', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <div>
              <label style={labelStyle}>用語名 *</label>
              <input type="text" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}
                placeholder="例：SLA" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>読み方（省略可）</label>
              <input type="text" value={form.reading} onChange={(e) => setForm({ ...form, reading: e.target.value })}
                placeholder="例：エスエルエー" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>カテゴリ</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '9999px', backgroundColor: selectedCategoryColor.bg, color: selectedCategoryColor.text, fontWeight: '500' }}>
                  {form.category}
                </span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>説明 *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="例：Service Level Agreement（サービスレベル合意）の略。..."
                required rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <input type="checkbox" id="awsExam" checked={form.awsExam}
                  onChange={(e) => setForm({ ...form, awsExam: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#f59e0b' }} />
                <label htmlFor="awsExam" style={{ fontSize: '15px', color: '#111827', cursor: 'pointer' }}>☁️ AWS試験に関連する</label>
              </div>
              {form.awsExam && (
                <textarea value={form.examPoint} onChange={(e) => setForm({ ...form, examPoint: e.target.value })}
                  placeholder="試験で出るポイント・注意点を入力..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }} />
              )}
            </div>

            <button type="submit"
              disabled={status === 'saving' || !form.term.trim() || !form.description.trim()}
              style={{
                padding: '14px', borderRadius: '10px', border: 'none',
                cursor: (status === 'saving' || !form.term.trim() || !form.description.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '16px', fontWeight: 'bold',
                backgroundColor: (status === 'saving' || !form.term.trim() || !form.description.trim()) ? '#d1d5db' : '#3b82f6',
                color: '#ffffff',
              }}>
              {status === 'saving' ? '保存中...' : '✅ 追加する'}
            </button>

            {status === 'success' && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '14px', textAlign: 'center' }}>
                🎉 用語を追加しました！
              </div>
            )}
            {status === 'error' && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '14px', textAlign: 'center' }}>
                ⚠️ {errorMsg}
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
