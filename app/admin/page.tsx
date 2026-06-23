'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
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
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // 認証状態を監視 + リダイレクト後の結果を取得
  useEffect(() => {
    async function init() {
      try {
        await getRedirectResult(auth)
      } catch (err) {
        console.error('リダイレクト結果エラー:', err)
      }
      onAuthStateChanged(auth, (u) => {
        setUser(u)
        setAuthLoading(false)
      })
    }
    init()
  }, [])

  // Googleサインイン（リダイレクト方式 - Safari/モバイル対応）
  async function handleSignIn() {
    try {
      await signInWithRedirect(auth, googleProvider)
    } catch (err) {
      console.error('サインインエラー:', err)
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
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '32px' }}>Googleアカウントでサインインしてください</p>
        <button
          onClick={handleSignIn}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 24px', borderRadius: '10px',
            border: '1px solid #e5e7eb', backgroundColor: '#ffffff',
            color: '#111827', fontSize: '16px', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでサインイン
        </button>
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
