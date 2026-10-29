// @ts-nocheck
// ** React Imports
import { Fragment, useEffect, useRef } from 'react'

// ** Custom Components
import ExtensionsHeader from '@components/extensions-header'

// ** Reactstrap Imports
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button } from 'reactstrap'

// ** Third Party Components
import Shepherd from 'shepherd.js'

// ** Styles
import 'shepherd.js/dist/css/shepherd.css'
import '@styles/react/libs/shepherd-tour/shepherd-tour.scss'

const backBtnClass = 'btn btn-sm btn-outline-primary',
  nextBtnClass = 'btn btn-sm btn-primary btn-next'

const buildSteps = tour => [
  {
    id: 'navbar',
    title: 'Navbar',
    text: 'This is your navbar',
    attachTo: { element: '.navbar', on: 'bottom' },
    cancelIcon: {
      enabled: true
    },
    buttons: [
      {
        action: () => tour.cancel(),
        classes: backBtnClass,
        text: 'Skip'
      },
      {
        text: 'Next',
        classes: nextBtnClass,
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'card',
    title: 'Card',
    text: 'This is a card',
    attachTo: { element: '#basic-tour .card', on: 'top' },
    cancelIcon: {
      enabled: true
    },
    buttons: [
      {
        text: 'Skip',
        classes: backBtnClass,
        action: () => tour.cancel()
      },
      {
        text: 'Back',
        classes: backBtnClass,
        action: () => tour.back()
      },
      {
        text: 'Next',
        classes: nextBtnClass,
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'footer',
    title: 'Footer',
    text: 'This is the footer',
    attachTo: { element: '.footer', on: 'top' },
    cancelIcon: {
      enabled: true
    },
    buttons: [
      {
        text: 'Back',
        classes: backBtnClass,
        action: () => tour.back()
      },
      {
        text: 'Finish',
        classes: nextBtnClass,
        action: () => tour.cancel()
      }
    ]
  }
]

const TourComponent = () => {
  const tourRef = useRef(null)

  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true
    })

    buildSteps(tour).forEach(step => {
      tour.addStep(step)
    })

    tourRef.current = tour

    return () => {
      tour.cancel()
      tourRef.current = null
    }
  }, [])

  return (
    <Fragment>
      <ExtensionsHeader
        title='Shepherd Tour'
        subTitle='Tourist Guide into your React Components With Shepherd.js'
        link='https://shepherdjs.dev/'
      />
      <Row id='basic-tour'>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <CardTitle tag='h4'>Tour</CardTitle>
            </CardHeader>
            <CardBody>
              <Button color='primary' onClick={() => tourRef.current?.start()} outline>
                Start Tour
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default TourComponent
