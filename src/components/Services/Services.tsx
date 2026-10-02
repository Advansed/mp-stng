import React, { useEffect }     from 'react';
import { useHistory }           from 'react-router-dom';
import { useServices }          from './useService';
import { IonBadge, IonButton, IonCard, IonIcon, IonLoading, IonText }
                                from '@ionic/react';
import { buildOutline, callOutline, documentTextOutline, flameOutline, gitBranchOutline, gitMergeOutline, locationOutline }
                                from 'ionicons/icons';
import { useNavigateStore }     from '../../Store/navigateStore';
import { useNavigation }        from '../../pages/useNavigation';
import { ROUTES, appStatusPath } from '../../routes';
import { Order }                from './Order';
import { TService, TServiceRecord, useServiceStore } from '../../Store/serviceStore';
import type { AppStatusEntry }  from '../../Store/appStore';
import { badgeColor, statusLabel } from '../Apps/appStatusUtils';
import styles                   from '../Apps/Apps.module.css';


const icons = {

    gitMergeOutline:        gitMergeOutline,
    buildOutline:           buildOutline,
    documentTextOutline:    documentTextOutline,
    callOutline:            callOutline,
    gitBranchOutline:       gitBranchOutline,
    gasCylinderOutline:     flameOutline,

}

export type ServiceGroup = {
  title: string
  source: TServiceRecord
  submitted: TServiceRecord[]
  editing?: TServiceRecord
}

function documentTitle(row: TServiceRecord): string {
  return String(row.title || row.text || '').trim()
}

function documentKind(row: TServiceRecord): 'draft' | 'contract' | 'template' {
  const kind = String(row.Тип || '').trim()
  if (kind === 'Черновик') return 'draft'
  if (kind === 'Договор') return 'contract'
  return 'template'
}

function contractStatus(row: TServiceRecord): string {
  const direct = String(row.status || row.Статус || '').trim()
  if (direct) return direct
  const history = row.statuses
  if (!history || history.length === 0) return ''
  return String(history[history.length - 1].status || '').trim()
}

function contractAddress(row: TServiceRecord): string {
  const chapters = row.chapters || []
  for (let i = 0; i < chapters.length; i++) {
    const fields = chapters[i].data || []
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j]
      if (field.name !== 'АдресОбъекта' && field.type !== 'address') continue
      const value = field.value
      if (typeof value === 'string' && value.trim()) return value.trim()
      if (value && typeof value === 'object' && typeof value.address === 'string' && value.address.trim()) {
        return value.address.trim()
      }
    }
  }
  return ''
}

export function groupServiceDocuments(rows: unknown): ServiceGroup[] {
  const list = Array.isArray(rows) ? rows as TServiceRecord[] : []
  const order: string[] = []
  const buckets = new Map<string, { draft?: TServiceRecord; template?: TServiceRecord; submitted: TServiceRecord[] }>()

  list.forEach((row) => {
    if (!row || typeof row !== 'object') return
    const title = documentTitle(row)
    if (!title) return
    if (!buckets.has(title)) {
      buckets.set(title, { submitted: [] })
      order.push(title)
    }
    const bucket = buckets.get(title)
    if (!bucket) return
    const kind = documentKind(row)
    if (kind === 'draft') {
      if (!bucket.draft) bucket.draft = row
    } else if (kind === 'contract') {
      bucket.submitted.push(row)
    } else if (!bucket.template) {
      bucket.template = row
    }
  })

  return order.reduce<ServiceGroup[]>((groups, title) => {
    const bucket = buckets.get(title)
    const source = bucket?.draft || bucket?.template
    if (!bucket || !source) return groups
    groups.push({ title, source, submitted: bucket.submitted })
    return groups
  }, [])
}

function hasChapters(row: TServiceRecord): boolean {
  return Array.isArray(row.chapters) && row.chapters.length > 0
}

function recordId(row: TServiceRecord): string {
  return row.id || row.doc_id || ''
}

export function serviceEditorTarget(rows: unknown, id: string): ServiceGroup | null {
  const groups = groupServiceDocuments(rows)
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const contract = group.submitted.find((row) => recordId(row) === id)
    if (contract && hasChapters(contract)) return { ...group, editing: contract }
    if (recordId(group.source) === id && hasChapters(group.source)) {
      return { ...group, editing: group.source }
    }
  }
  return null
}

function formRecord(group: ServiceGroup): TServiceRecord {
  if (group.editing && hasChapters(group.editing)) return group.editing
  return group.source
}

function serviceIcon(row: TServiceRecord) {
  const name = row.icon as keyof typeof icons | undefined
  if (name && icons[name]) return icons[name]
  return documentTextOutline
}

export const Services: React.FC = () => {

  const { services, loadServices, saveService, preview } = useServices()
  const { page, setPage, item, setItem } = useNavigation()
  const history = useHistory()

  const loading = useServiceStore((state) => state.loading)
  const currentPage = useNavigateStore(state => state.currentPage)
  const setCurrentPage = useNavigateStore((state) => state.setCurrentPage)
  const group = item as ServiceGroup | null
  const groups = groupServiceDocuments(services)


  useEffect(()=>{
    if(currentPage !== ROUTES.services) return
    if(page !== 0) return
    if(!services || services.length === 0) loadServices()
    else void loadServices({ silent: true })
  },[currentPage, page])

  useEffect(() => {
    if (currentPage !== ROUTES.services) return
    if (page > 0 && !group?.source) setPage(0)
  }, [currentPage, page, group, setPage])

  useEffect(() => {
    if (currentPage !== ROUTES.services) return
    if (page !== 2 || !group) return
    if (!hasChapters(formRecord(group))) setPage(1)
  }, [currentPage, page, group, setPage])

  const openOrder = () => {
    if (!group?.source || !hasChapters(group.source)) return
    setItem({ ...group, editing: undefined })
    setPage(2)
  }

  const openStatuses = (row: TServiceRecord) => {
    const id = row.id || row.doc_id
    if (!id) return
    const path = appStatusPath(id)
    setCurrentPage(path)
    history.push(path, { statuses: row.statuses as AppStatusEntry[] | undefined })
  }

  return <>
    <IonLoading isOpen = { page === 0 && loading } message={ "Подождите загрузка услуг..." }/>
    {
        page === 0
          ? groups.map((entry) => (
              <IonCard className="pt-2 pb-2" key={entry.title}>
                  <div className="flex"
                      onClick={()=>{
                            setItem( entry )
                            setPage( 1 )
                      }}
                  >
                      <IonIcon icon = { serviceIcon(entry.source) }  className="h-2 w-20" color="tertiary"/>
                      <IonText className="cl-prim fs-12 w-80"><b>{ entry.title }</b> </IonText>
                  </div>
              </IonCard>
            ))
          : page === 1 && group
          ? <>
              <IonText>
                <h1 className="main-title ion-text-wrap ml-1">{ group.title }</h1>
              </IonText>
              <IonButton
                expand="block"
                className="ion-margin"
                disabled={!hasChapters(group.source)}
                onClick={openOrder}
              >
                Создать заявку
              </IonButton>
              {group.submitted.length === 0 ? (
                <div className={styles.appsContainer}>
                  <div className={styles.emptyCard}>
                    <IonIcon icon={documentTextOutline} className={styles.emptyIcon} aria-hidden />
                    <div className={styles.emptyTitle}>Нет заявок и договоров</div>
                    <p className={styles.emptyText}>По этой услуге пока ничего не оформлено</p>
                  </div>
                </div>
              ) : (
                <div className={styles.appsContainer}>
                  {group.submitted.map((row, i) => {
                    const address = contractAddress(row)
                    const status = contractStatus(row)
                    const id = row.id || row.doc_id
                    return (
                    <IonCard
                      key={id || i}
                      className={styles.appCard}
                      button={!!id}
                      onClick={() => openStatuses(row)}
                    >
                      <div className={styles.appCardInner}>
                        <div className={styles.appTop}>
                          <div className={styles.appService}>
                            <IonIcon icon={documentTextOutline} className={styles.serviceIcon} aria-hidden />
                            <h2 className={styles.serviceText}>{group.title}</h2>
                          </div>
                          {status ? (
                            <IonBadge color={badgeColor(status)} className={styles.statusBadge}>
                              {statusLabel(status)}
                            </IonBadge>
                          ) : null}
                        </div>
                        {address ? (
                          <div className={styles.appAddress}>
                            <IonIcon icon={locationOutline} className={styles.addressIcon} aria-hidden />
                            <div className={styles.addressBody}>
                              <div className={styles.addressLabel}>Адрес</div>
                              <div className={styles.addressValue}>{address}</div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </IonCard>
                    )
                  })}
                </div>
              )}
            </>
          : group && hasChapters(formRecord(group))
          ? <Order
              service   = { formRecord(group) as TService }
              onSave    = { async (orderData: any, options?: { silent?: boolean }) => {
                return await saveService(orderData, options)
              } }
              onBack    = { () => {
                const fresh = groupServiceDocuments(useServiceStore.getState().services)
                  .find((entry) => entry.title === group.title)
                if (fresh) setItem(fresh)
                setPage(1)
              }}
              onPreview = { preview }
          />
          : null
    }
  </>
};
