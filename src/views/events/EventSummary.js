import './event.scss'
import React, { useState, useEffect } from 'react'
import {
    CDataTable,
    CTabs,
    CNav,
    CNavItem,
    CCol,
    CRow,
    CNavLink
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import * as fbDb from 'src/services/index'
import { isEmpty, find, toUpper } from 'lodash'
import { useMediaQuery } from 'react-responsive'
import { SET_LOGO } from 'src/actions/types'

const EventSummary = (props) => {
    console.log(props)
    const largeScreen = useMediaQuery({
        query: '(min-device-width: 600px)'
    });
    const eventId = toUpper(props.eventId || props.match.params.id)
    const dispatch = useDispatch()
    const history = useHistory()
    const sysUser = useSelector(state => state.auth.user);
    const event = useSelector(state => state.auth.event);
    const evtTeams = useSelector(state => state.event.teams);
    const storedUsers = useSelector(state => state.auth.users);
    const [userPoints, setUserPoints] = useState([]);
    const [selectRound, setSelectRound] = useState(props.round || event.round);

    const fields = [
        { key: 'pos', label: '', _classes: 'text-center' },
        { key: 'name', label: 'Tên', _classes: 'align-middle' },
        { key: 'winner', label: largeScreen ? 'Vô địch' : 'VĐ', _classes: 'text-center' },
        { key: 'corrected', label: largeScreen ? 'Đúng' : 'Đ', _classes: 'align-middle text-center' },
        { key: 'wrong', label: largeScreen ? 'Sai' : 'S', _classes: 'text-center' },
        { key: 'missed', label: largeScreen ? 'Bỏ qua' : 'M', _classes: 'text-center d-none d-sm-table-cell' },
        { key: 'percent', label: '%', _classes: 'text-center' },
        { key: 'point', label: largeScreen ? 'Điểm' : 'Pts', _classes: 'text-center' },
    ]

    const onClickUserItem = (user) => {
        history.push(`/event-user/${user.id}`)
    }

    useEffect(async () => {

        if (userPoints.length == 0 && evtTeams.length > 0 && storedUsers.length > 0) {
            dispatch({
                type: SET_LOGO,
                payload: {
                    icon: 'logo',
                    img: ''
                }
            })

            let userPts = await fbDb.BettingService.getUserBettingResults(sysUser.group, eventId, 0)
            const eventSummary = await fbDb.EventService.getEventSummary(eventId)

            userPts = userPts.map((user) => {
                var favTeam = {}
                var newUser = null
                var userInfo = find(storedUsers, ['id', user.id]);
                if (!isEmpty(eventSummary.users[user.id] && eventSummary.users[user.id].betTeam)) {
                    favTeam = find(evtTeams, ['id', eventSummary.users[user.id].betTeam])
                }
                if (favTeam === undefined) {
                    console.log(evtTeams)
                }

                if (user.id == sysUser.id) {
                    newUser = { ...user, ...userInfo, favTeam: favTeam || {}, _classes: 'my-position' }
                } else {
                    newUser = { ...user, ...userInfo, favTeam: favTeam || {} }
                }
                return newUser;
            })

            setUserPoints(userPts)

        }
    }, [evtTeams]);

    if (isEmpty(userPoints)) {
        return <div></div>
    }

    return (
        <>
            {/* <CRow className="user-point-header">
                <CCol md="3">
                    <span className="title">BẢNG XẾP HẠNG</span>
                </CCol>
                <CCol>
                    <CNav className="justify-content-end">
                        <CNavLink active>Active</CNavLink>
                        <CNavLink>Link</CNavLink>
                        <CNavLink>Link</CNavLink>
                        <CNavLink>Disabled</CNavLink>
                    </CNav>
                </CCol>
            </CRow> */}
            <CRow className="event-data">
                <CCol>
                    <CDataTable
                        header={true}
                        clickableRows={true}
                        items={userPoints}
                        fields={fields}
                        onRowClick={
                            (item) => onClickUserItem(item)}
                        scopedSlots={{
                            'pos':
                                (item, index) => (
                                    <td className="text-center align-middle">
                                        {index + 1}
                                    </td>
                                ),
                            'name':
                                (item) => (
                                    <td className="align-items-center d-flex">
                                        <CIcon className="c-avatar mr-2" width="36" src={item.avatar}></CIcon>
                                        <span className="d-none d-sm-block">{item.name}</span>
                                        <span className="d-block d-sm-none">{item.initName}</span>
                                    </td>
                                ),
                            'winner':
                                (item) => (
                                    <td className="text-center">
                                        <CIcon className="" width="36" name={item.favTeam.flagCode || 'flag-tbd'}></CIcon>
                                    </td>
                                ),
                            'corrected':
                                (item) => (
                                    <td className="text-center align-middle">
                                        {item.result.corrected}
                                    </td>
                                ),
                            'wrong':
                                (item) => (
                                    <td className="text-center align-middle">
                                        {item.result.wrong}
                                    </td>
                                ),

                            'missed':
                                (item) => (
                                    <td className="text-center align-middle d-none d-sm-table-cell">
                                        {item.result.missed}
                                    </td>
                                ),
                            'percent':
                                (item) => (
                                    <td className="text-center align-middle">
                                        {Math.round(item.result.percent * 100)}%
                                    </td>
                                ),
                            'point':
                                (item) => (
                                    <td className="text-center align-middle">
                                        {item.result.point}
                                    </td>
                                ),
                        }}
                    />
                </CCol>
            </CRow>

        </>
    )
}

export default EventSummary
