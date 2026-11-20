import { describe, expect, it } from 'vitest'
import { assertStructureEditable } from '../../../shared/utils/tests'

describe('assertStructureEditable', () => {
  it('T-HU004-06 a published test and a draft with answers need a new version', () => {
    expect(assertStructureEditable({ status: 'published' }, false)).toEqual({ ok: false, code: 'new_version_required' })
    expect(assertStructureEditable({ status: 'draft' }, true)).toEqual({ ok: false, code: 'new_version_required' })
  })

  it('T-HU004-06 an archived test is not editable either', () => {
    expect(assertStructureEditable({ status: 'archived' }, false)).toEqual({ ok: false, code: 'new_version_required' })
  })

  it('T-HU004-07 a draft without answers is editable', () => {
    expect(assertStructureEditable({ status: 'draft' }, false)).toEqual({ ok: true })
  })
})

describe('assertStructureEditable · import (HU008)', () => {
  it('T-HU008-08 importing over a published test needs a new version', () => {
    expect(assertStructureEditable({ status: 'published' }, false)).toEqual({ ok: false, code: 'new_version_required' })
    expect(assertStructureEditable({ status: 'archived' }, false)).toEqual({ ok: false, code: 'new_version_required' })
    expect(assertStructureEditable({ status: 'draft' }, false)).toEqual({ ok: true })
  })
})
