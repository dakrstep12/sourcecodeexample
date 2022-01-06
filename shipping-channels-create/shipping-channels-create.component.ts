import { Component, OnInit } from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import { DataService } from '../../core/utils/http/data.service'
import { IFormBuilder } from '@rxweb/types'
import { faMapMarkerAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
import { AuthUserStore } from '../../core/auth/auth-user.store'
import { CompanyService } from '../../core/services/company.service'
import { ActivatedRoute, Router } from '@angular/router'
import { debounceTime, share, shareReplay, take, throttleTime } from 'rxjs/operators'
import { lowerCase } from '@rxweb/reactive-form-validators'
import { logRed } from '../../shared/utils/log'
import { GappSetting } from '@geeesy/type-interfaces'


@Component({
  selector: 'project-shipping-channels-create',
  templateUrl: './shipping-channels-create.component.html',
  styles: [],
})
export class ShippingChannelsCreateComponent implements OnInit {
  clicked: boolean = false
  businessId: string
  compId: string
  params
  faTrash = faTrash
  shippings = this.dataService.getShippingMethod()
  selShipping: any
  methodName: string
  typePaymentList = [
    'ฟรี ไม่เก็บค่าจัดส่ง',    
    'กำหนดค่าจัดส่งวัสดุแบบคงที่',
    'คิดตามจำนวนสินค้า (คิดเป็นชิ้น)',
    'คิดตามจำนวนสินค้า',
    'คิดตามน้ำหนักรวมของสินค้า',
    'คิดตามราคาของสินค้าหลังหักส่วนลดแล้ว',
  ]

  shippingList = [
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/thaipost.webp",
      shippingMethodId: "1",
      shippingMethodName: "thailand post"
    },
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/kerry.webp",
      shippingMethodId: "2",
      shippingMethodName: "kerry"
    },
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/jt.webp",
      shippingMethodId: "3",
      shippingMethodName: "j&t"
    },
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/flash.webp",
      shippingMethodId: "4",
      shippingMethodName: "flash"
    },
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/ninja.webp",
      shippingMethodId: "5",
      shippingMethodName: "ninja van"
    },
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/grab.webp",
      shippingMethodId: "6",
      shippingMethodName: "grab"
    },
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/lalamove.webp",
      shippingMethodId: "7",
      shippingMethodName: "lalamove"
    },
    {
      shippingMethodIconUrl: "https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/icons/lineman.webp",
      shippingMethodId: "8",
      shippingMethodName: "line man"
    }
  ]
  
  typePaymentLists = [
    {
      type: 'ฟรี ไม่เก็บค่าจัดส่ง',
      value: 'free' 
    },
    {
      type: 'กำหนดค่าจัดส่งวัสดุแบบคงที่',
      value: 'fixedRate'
    },
    {
      type: 'คิดตามจำนวนสินค้า (คิดเป็นชิ้น)',
      value: 'basedByPcs'
    },
    {
      type: 'คิดตามจำนวนสินค้า',
      value: 'basedByStepPcs'
    },
    {
      type: 'คิดตามน้ำหนักรวมของสินค้า',
      value: 'basedByStepWeight'
    },
    {
      type: 'คิดตามราคาของสินค้าหลังหักส่วนลดแล้ว',
      value: 'basedByOrderPrice'
    }
  ]

  selType = ''

  formBuilder: IFormBuilder
  shippingForm: FormGroup
  shippingFormReal: FormGroup
  shippingFormRealSave: FormGroup
  detailShipping: GappSetting.ShippingMethod

  formgExceedbasedByStepPcs: FormGroup
  formgExceedbasedByStepWeight: FormGroup
  formgExceedbasedByOrderPrice: FormGroup

  cbfixedRate: FormControl = new FormControl(false)
  cbbasedByPcs: FormControl = new FormControl(false)
  cbbasedByStepPcs: FormControl = new FormControl(false)
  cbbasedByStepWeight: FormControl = new FormControl(false)

  constructor(
    fb: FormBuilder,
    private dataService: DataService,
    public authUser: AuthUserStore,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formBuilder = fb
  }

  ngOnInit(): void {
    this.businessId = this.authUser.compState.businessId
    this.compId = this.authUser.compState.compId
    this.params = this.route.snapshot.params.type

    this.buildForm()
    this.initForm()

    if (this.compId) {
      this.shippingForm.get('compId').patchValue(this.compId)
    }
  }


  initForm() {
    this.shippingFormReal = this.formBuilder.group<GappSetting.CreateShippingMethod>({
      shippingParty: undefined,
      shippingIconUrl: '',
      shippingAliasName: ['', Validators.required],
      deliveryTime: this.formBuilder.group({
        earliest: 1,
        last: 2,
      }),
      note: '',
      shippingMethodAttribute: this.formBuilder.group({
      
      }),
      shippingMethodType: [undefined, Validators.required],
      businessId: this.businessId,
      compId: this.compId,
      identityId: JSON.parse(localStorage.getItem('userState')).identityId,
      companyCode: this.authUser.compState.compCode,
      isCOD: false,
      activeOnMarket: false,
    })

    this.shippingFormRealSave = this.formBuilder.group<GappSetting.CreateShippingMethod>({
      shippingParty: undefined,
      shippingIconUrl: '',
      shippingAliasName: ['', Validators.required],
      deliveryTime: this.formBuilder.group({
        earliest: 1,
        last: 2,
      }),
      note: '',
      shippingMethodAttribute: this.formBuilder.group({
      
      }),
      shippingMethodType: [undefined, Validators.required],
      businessId: this.businessId,
      compId: this.compId,
      identityId: JSON.parse(localStorage.getItem('userState')).identityId,
      companyCode: this.authUser.compState.compCode,
      isCOD: false,
      activeOnMarket: false,
    })

    this.formgExceedbasedByStepPcs = this.formBuilder.group({
      minPcs: 0,
      shippingCost: 0
    })

    this.formgExceedbasedByStepWeight = this.formBuilder.group({
      minWeight: 0,
      shippingCost: 0
    })

    this.formgExceedbasedByOrderPrice = this.formBuilder.group({
      minOrderTotalAmount: 0,
      shippingCost: 0
    })

    if (this.params !== 'new') this.patchValue()

  }

  get groupArrshippingMethodAttribute(): FormArray {
    return this.shippingFormReal
      .get('shippingMethodAttribute')
      .get('shippingCost') as unknown as FormArray
  }

  get groupArrshippingMethodAttributeSave(): FormArray {
    return this.shippingFormRealSave
      .get('shippingMethodAttribute')
      .get('shippingCost') as unknown as FormArray
  }

  get groupArrcalnumberProducts(): FormArray {
    return this.shippingForm
      .get('calnumberProducts')
      .get('notexceedPiece') as unknown as FormArray
  }

  get groupArrcalnumberProductsWeight(): FormArray {
    return this.shippingForm
      .get('calnumberProductsWeight')
      .get('notexceedKg') as unknown as FormArray
  }

  get groupArrcalnumberProductsDiscount(): FormArray {
    return this.shippingForm
      .get('calnumberProductsDiscount')
      .get('notexceedPrice') as unknown as FormArray
  }

  buildForm() {
    this.shippingForm = this.formBuilder.group({
      shippingId: '',
      shippingIconUrl: '',
      shippingName: ['', Validators.required],
      typeCalPrice: ['', Validators.required],
      typeDelivery: 'ธรรมดา',
      shippingStatus: true,
      deliveryTime: this.formBuilder.group({
        start: 0,
        end: 0,
      }),
      note: '',
      compId: '',
      createdAt: '',
      updatedAt: '',
      fixedDelivery: this.formBuilder.group({
        fixedPrice: 0,
        freeshippingPrice: null,
      }),
      calnumberProductsPiece: this.formBuilder.group({
        fitstpiecePrice: 0,
        nextpiecePrice: 0,
        freeshippingPrice: null,
      }),
      calnumberProducts: this.formBuilder.group({
        notexceedPiece: this.formBuilder.array([
          this.formBuilder.group({
            numberofPiece: 0,
            amount: 0,
            freeshipping: false,
          }),
        ]),
        exceedPiece: this.formBuilder.group({
          numberofPiece: 0,
          amount: 0,
          freeshipping: false,
        }),
        freeshippingPrice: null,
      }),
      calnumberProductsWeight: this.formBuilder.group({
        notexceedKg: this.formBuilder.array([
          this.formBuilder.group({
            numberofWeight: 0,
            unitWeight: 'กิโลกรัม',
            amount: 0,
            freeshipping: false,
          }),
        ]),
        exceedKg: this.formBuilder.group({
          numberofWeight: 0,
          unitWeight: 'กิโลกรัม',
          amount: 0,
          freeshipping: false,
        }),
        freeshippingPrice: null,
      }),
      calnumberProductsDiscount: this.formBuilder.group({
        notexceedPrice: this.formBuilder.array([
          this.formBuilder.group({
            numberofAmount: 0,
            amount: 0,
            freeshipping: false,
          }),
        ]),
        exceedPrice: this.formBuilder.group({
          numberofAmount: 0,
          amount: 0,
          freeshipping: false,
        }),
      }),
    })


  }

  patchValue() {
    this.companyService.getShippingByIdReal(this.businessId, this.compId, this.params).subscribe((res) => {
      if(res.shippingParty === 'thaipost') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'thailand post'
        }
      } else if(res.shippingParty === 'lineman') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'line man'
        }
      } else if(res.shippingParty === 'kerry') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'kerry'
        }
      } else if(res.shippingParty === 'jt') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'j&t'
        }
      } else if(res.shippingParty === 'flash') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'flash'
        }
      } else if(res.shippingParty === 'ninja') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'ninja van'
        }
      } else if(res.shippingParty === 'grab') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'grab'
        }
      } else if(res.shippingParty === 'lalamove') {
        this.selShipping = {
          shippingMethodIconUrl: 'https://gapp-pub-blob-dev.s3.ap-southeast-1.amazonaws.com/' + res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'lalamove'
        }
      } else if(res.shippingParty === 'other') {
        this.selShipping = {
          shippingMethodIconUrl: res.shippingIconUrl,
          shippingMethodId: res.shippingMethodId,
          shippingMethodName: 'other'
        }
      }
  
      console.log('Patch res', res)
      this.selType = res.shippingMethodType

      if(this.selType == 'free') {
        this.shippingFormReal.removeControl('shippingMethodAttribute')
        
        this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          caption: ''
        }))

        this.shippingFormRealSave.removeControl('shippingMethodAttribute')
        this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          caption: ''
        }))
      } else if(this.selType == 'fixedRate') {
        this.shippingFormReal.removeControl('shippingMethodAttribute')   
        if(res.shippingMethodAttribute.minOrderTotalAmount !== 0) {
          this.cbfixedRate.patchValue(true)
        }
        this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
          shippingCost: 0,
          minOrderTotalAmount: 0,
          caption: ''
        }))

        this.shippingFormRealSave.removeControl('shippingMethodAttribute')  
        this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
          shippingCost: 0,
          minOrderTotalAmount: 0,
          caption: ''
        }))

      } else if(this.selType == 'basedByPcs') {
        this.shippingFormReal.removeControl('shippingMethodAttribute')     
        if(res.shippingMethodAttribute.minOrderTotalAmount !== 0) {
          this.cbbasedByPcs.patchValue(true)
        }
        this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          shippingCostFirstPcs: 0,
          shippingCostPerPcs: 0,
          caption: ''
        }))

        this.shippingFormRealSave.removeControl('shippingMethodAttribute')  
        this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          shippingCostFirstPcs: 0,
          shippingCostPerPcs: 0,
          caption: ''
        }))

      } else if(this.selType == 'basedByStepPcs') {
        this.shippingFormReal.removeControl('shippingMethodAttribute')
        
        if(res.shippingMethodAttribute.minOrderTotalAmount !== 0) {
          this.cbbasedByStepPcs.patchValue(true)
        }
        this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          shippingCost: this.formBuilder.array([
            this.formBuilder.group({
              minPcs: 0,
              shippingCost: 0
            })
          ]),
          caption: ''
        }))

        this.shippingFormRealSave.removeControl('shippingMethodAttribute')
        this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          shippingCost: this.formBuilder.array([
            this.formBuilder.group({
              minPcs: 0,
              shippingCost: 0
            })
          ]),
          caption: ''
        }))

        const formArrshippingCost: FormArray = <FormArray>this.shippingFormReal.get('shippingMethodAttribute.shippingCost')
        const formArrshippingCostSave: FormArray = <FormArray>this.shippingFormRealSave.get('shippingMethodAttribute.shippingCost')

        res.shippingMethodAttribute.shippingCost.forEach((el, index) => {
          if(index > 0 && index < (res.shippingMethodAttribute.shippingCost.length - 1)) {
            formArrshippingCost.push(this.formBuilder.group({
              minPcs: [0, Validators.min((+res.shippingMethodAttribute.shippingCost[index - 1].minPcs) + 1)],
              shippingCost: 0
            }))

            formArrshippingCostSave.push(this.formBuilder.group({
              minPcs: 0,
              shippingCost: 0
            }))
          } else if(index == (res.shippingMethodAttribute.shippingCost.length - 1)) {
            this.formgExceedbasedByStepPcs.patchValue(el)
          }

        }); 
        
      } else if(this.selType == 'basedByStepWeight') {
        this.shippingFormReal.removeControl('shippingMethodAttribute')
        
        if(res.shippingMethodAttribute.minOrderTotalAmount !== 0) {
          this.cbbasedByStepWeight.patchValue(true)
        }
        this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          shippingCost: this.formBuilder.array([
            this.formBuilder.group({
              minWeight: 0,
              shippingCost: 0
            })
          ]),
          caption: '',
        }))

        this.shippingFormRealSave.removeControl('shippingMethodAttribute')
        this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
          minOrderTotalAmount: 0,
          shippingCost: this.formBuilder.array([
            this.formBuilder.group({
              minWeight: 0,
              shippingCost: 0
            })
          ]),
          caption: '',
        }))

        const formArrshippingCost: FormArray = <FormArray>this.shippingFormReal.get('shippingMethodAttribute.shippingCost')
        const formArrshippingCostSave: FormArray = <FormArray>this.shippingFormRealSave.get('shippingMethodAttribute.shippingCost')

        res.shippingMethodAttribute.shippingCost.forEach((el, index) => {
          if(index > 0 && index < (res.shippingMethodAttribute.shippingCost.length - 1)) {
            formArrshippingCost.push(this.formBuilder.group({
              minWeight: [0, Validators.min((+res.shippingMethodAttribute.shippingCost[index - 1].minWeight) + 0.01)],
              shippingCost: 0
            }))

            formArrshippingCostSave.push(this.formBuilder.group({
              minWeight: 0,
              shippingCost: 0
            }))

          } else if(index == (res.shippingMethodAttribute.shippingCost.length - 1)) {
            this.formgExceedbasedByStepWeight.patchValue(el)
          }
        });
      } else if(this.selType == 'basedByOrderPrice') {
        this.shippingFormReal.removeControl('shippingMethodAttribute')

        this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
          shippingCost: this.formBuilder.array([
            this.formBuilder.group({
              minOrderTotalAmount: 0,
              shippingCost: 0
            })
          ]),
          caption: ''
        }))

        this.shippingFormRealSave.removeControl('shippingMethodAttribute')
        this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
          shippingCost: this.formBuilder.array([
            this.formBuilder.group({
              minOrderTotalAmount: 0,
              shippingCost: 0
            })
          ]),
          caption: ''
        }))

        const formArrshippingCost: FormArray = <FormArray>this.shippingFormReal.get('shippingMethodAttribute.shippingCost')
        const formArrshippingCostSave: FormArray = <FormArray>this.shippingFormRealSave.get('shippingMethodAttribute.shippingCost')

        res.shippingMethodAttribute.shippingCost.forEach((el, index) => {
          if(index > 0 && index < (res.shippingMethodAttribute.shippingCost.length - 1)) {
            formArrshippingCost.push(this.formBuilder.group({
              minOrderTotalAmount: [0, Validators.min((+res.shippingMethodAttribute.shippingCost[index - 1].minOrderTotalAmount) + 0.01)],
              shippingCost: 0
            }))

            formArrshippingCostSave.push(this.formBuilder.group({
              minOrderTotalAmount: 0,
              shippingCost: 0
            }))

          } else if(index == (res.shippingMethodAttribute.shippingCost.length - 1)) {
            this.formgExceedbasedByOrderPrice.patchValue(el)
          }
        });
      }

      this.shippingFormReal.patchValue(res)
      this.detailShipping = res
      console.log('Patch All Success =>', this.shippingFormReal.getRawValue())

    })
  }

  update() {
    this.clicked = true
    let dataForm: GappSetting.CreateShippingMethod = this.shippingFormReal.getRawValue()

    this.shippingFormRealSave.patchValue(dataForm)
    console.log('shippingFormRealSave =>', this.shippingFormRealSave.getRawValue())

    let dataFormSave: GappSetting.CreateShippingMethod = this.shippingFormRealSave.getRawValue()

    // if(dataForm.shippingMethodType == 'basedByStepPcs') {
    //   this.groupArrshippingMethodAttribute.push(this.formgExceedbasedByStepPcs)
    //   dataForm = this.shippingFormReal.getRawValue()
    //   console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttribute.value)
    // } else if(dataForm.shippingMethodType == 'basedByStepWeight') {
    //   this.groupArrshippingMethodAttribute.push(this.formgExceedbasedByStepWeight)
    //   dataForm = this.shippingFormReal.getRawValue()
    //   console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttribute.value)
    // } else if(dataForm.shippingMethodType == 'basedByOrderPrice') {
    //   this.groupArrshippingMethodAttribute.push(this.formgExceedbasedByOrderPrice)
    //   dataForm = this.shippingFormReal.getRawValue()
    //   console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttribute.value)
    // }

    //formRealsave
    if(dataFormSave.shippingMethodType == 'basedByStepPcs') {
      this.groupArrshippingMethodAttributeSave.push(this.formgExceedbasedByStepPcs)
      dataFormSave = this.shippingFormRealSave.getRawValue()
      console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttributeSave.value)
    } else if(dataFormSave.shippingMethodType == 'basedByStepWeight') {
      this.groupArrshippingMethodAttributeSave.push(this.formgExceedbasedByStepWeight)
      dataFormSave = this.shippingFormRealSave.getRawValue()
      console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttributeSave.value)
    } else if(dataFormSave.shippingMethodType == 'basedByOrderPrice') {
      this.groupArrshippingMethodAttributeSave.push(this.formgExceedbasedByOrderPrice)
      dataFormSave = this.shippingFormRealSave.getRawValue()
      console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttributeSave.value)
    }

    let DBupdateForm: GappSetting.ShippingMethod = {
      shippingParty: dataFormSave.shippingParty,
      shippingIconUrl: dataFormSave.shippingIconUrl,
      shippingAliasName: dataFormSave.shippingAliasName,
      deliveryTime: dataFormSave.deliveryTime,
      note: dataFormSave.note,
      shippingMethodAttribute: dataFormSave.shippingMethodAttribute,
      shippingMethodType: dataFormSave.shippingMethodType,
      createdAt: '',
      updatedAt: '',
      isActive: this.detailShipping.isActive,
      shippingMethodId: this.detailShipping.shippingMethodId,
      compId: this.detailShipping.compId,
      isCOD: this.detailShipping.isCOD,
      activeOnMarket: dataFormSave.activeOnMarket,
      hasArchived:false
    }

    console.log('[POST] Update shippingform ---> ', dataForm)
    console.log('[POST] Update shippingformSave ---> ', dataFormSave)

    if(this.businessId && this.compId && this.params !== 'new') {
      this.companyService.updateShippingReal(
        this.businessId,
        this.compId,
        this.params,
        DBupdateForm
      ).subscribe(
        (res) => console.log(res),
        (err) => logRed(err),
        () => this.router.navigateByUrl('/app/setting/shipping-channels')
      )
    }
   
  }

  patchDeliveryTime(value: number, type: string) {
    console.log('deliveryTime', value)
    // if(type == 'deliveryTime.earliest') {
    //   if(value < (+this.shippingFormReal.get('deliveryTime.last').value)) {
    //     this.shippingFormReal.get(type).patchValue(+value)
    //   } else {

    //   }
    // } else {
    //   if(value > (+this.shippingFormReal.get('deliveryTime.earliest').value)) {
    //     this.shippingFormReal.get(type).patchValue(+value)
    //   } else {

    //   }
    // }
    this.shippingFormReal.get(type).patchValue(+value)

    // if(
    //   this.shippingFormReal.get('deliveryTime.earliest').value > this.shippingFormReal.get('deliveryTime.last').value
    //   || this.shippingFormReal.get('deliveryTime.earliest').value == this.shippingFormReal.get('deliveryTime.last').value
    // ) {
    //   console.log('setErrors Form')
    //   this.shippingFormReal.get(type).markAsDirty()
    // } else {
    //   this.shippingFormReal.get(type).markAsPristine()
    // }
    
  }

  selectType(type) {
    this.selType = type
    // this.shippingForm.patchValue({
    //   typeCalPrice: type,
    // })

    this.shippingFormReal.patchValue({
      shippingMethodType: type
    })

   
    //push form group
    if(type == 'free') {
      console.log('Select Type free')
      this.shippingFormReal.removeControl('shippingMethodAttribute')
      
      this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        caption: ''
      }))

      this.shippingFormRealSave.removeControl('shippingMethodAttribute')
      this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        caption: ''
      }))

      console.log('Show Form Select', this.shippingFormReal.value)
    } else if(type == 'fixedRate') {
      console.log('Select Type fixedRate')
      this.shippingFormReal.removeControl('shippingMethodAttribute')

      this.cbfixedRate.patchValue(false)

      this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
        shippingCost: 0,
        minOrderTotalAmount: 0,
        caption: ''
      }))

      this.shippingFormRealSave.removeControl('shippingMethodAttribute')
      this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
        shippingCost: 0,
        minOrderTotalAmount: 0,
        caption: ''
      }))

      console.log('Show Form Select', this.shippingFormReal.value)
    } else if(type == 'basedByPcs') {
      console.log('Select Type basedByPcs')
      this.shippingFormReal.removeControl('shippingMethodAttribute')

      this.cbbasedByPcs.patchValue(false)

      this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        shippingCostFirstPcs: 0,
        shippingCostPerPcs: 0,
        caption: ''
      }))

      this.shippingFormRealSave.removeControl('shippingMethodAttribute')
      this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        shippingCostFirstPcs: 0,
        shippingCostPerPcs: 0,
        caption: ''
      }))

      console.log('Show Form Select', this.shippingFormReal.value)
    } else if(type == 'basedByStepPcs') {
      console.log('Select Type basedByStepPcs')
      this.shippingFormReal.removeControl('shippingMethodAttribute')
      this.cbbasedByStepPcs.patchValue(false)
      this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        shippingCost: this.formBuilder.array([
          this.formBuilder.group({
            minPcs: 0,
            shippingCost: 0
          })
        ]),
        caption: ''
      }))


      this.shippingFormRealSave.removeControl('shippingMethodAttribute')
      this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        shippingCost: this.formBuilder.array([
          this.formBuilder.group({
            minPcs: 0,
            shippingCost: 0
          })
        ]),
        caption: ''
      }))

      console.log('Show Form Select', this.shippingFormReal.value)
    } else if(type == 'basedByStepWeight') {
      console.log('Select Type basedByStepWeight')
      this.shippingFormReal.removeControl('shippingMethodAttribute')
      this.cbbasedByStepWeight.patchValue(false)
      this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        shippingCost: this.formBuilder.array([
          this.formBuilder.group({
            minWeight: 0,
            shippingCost: 0
          })
        ]),
        caption: '',
      }))

      this.shippingFormRealSave.removeControl('shippingMethodAttribute')
      this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
        minOrderTotalAmount: 0,
        shippingCost: this.formBuilder.array([
          this.formBuilder.group({
            minWeight: 0,
            shippingCost: 0
          })
        ]),
        caption: '',
      }))


      console.log('Show Form Select', this.shippingFormReal.value)
    } else if(type == 'basedByOrderPrice') {
      console.log('Select Type basedByOrderPrice')
      this.shippingFormReal.removeControl('shippingMethodAttribute')

      this.shippingFormReal.addControl('shippingMethodAttribute', this.formBuilder.group({
        shippingCost: this.formBuilder.array([
          this.formBuilder.group({
            minOrderTotalAmount: 0,
            shippingCost: 0
          })
        ]),
        caption: ''
      }))

      this.shippingFormRealSave.removeControl('shippingMethodAttribute')
      this.shippingFormRealSave.addControl('shippingMethodAttribute', this.formBuilder.group({
        shippingCost: this.formBuilder.array([
          this.formBuilder.group({
            minOrderTotalAmount: 0,
            shippingCost: 0
          })
        ]),
        caption: ''
      }))

      console.log('Show Form Select', this.shippingFormReal.value)
    } 

    // console.log(this.selType)
  }

  selPayment(item) {
    this.selShipping = item
    this.methodName = item.shippingMethodName

    if(this.methodName === 'thailand post') {
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'Thailand Post',
        shippingParty: 'thaipost'
      })
    } else if(this.methodName === 'j&t') {
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'J&T',
        shippingParty: 'jt'
      })
    } else if(this.methodName === 'ninja van') {
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'Ninja Van',
        shippingParty: 'ninja'
      })
    } else if(this.methodName === 'line man') {
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'LINE MAN',
        shippingParty: 'lineman'
      })
    } else if(this.methodName === 'kerry'){
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'Kerry',
        shippingParty: 'kerry'
      })
    } else if(this.methodName === 'flash'){
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'Flash',
        shippingParty: 'flash'
      })
    } else if(this.methodName === 'grab'){
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'Grab',
        shippingParty: 'grab'
      })
    } else if(this.methodName === 'lalamove'){
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: 'Lalamove',
        shippingParty: 'lalamove'
      })
    } else if(this.methodName === 'other'){
      // blank
      this.shippingFormReal.patchValue({
        shippingIconUrl: item.shippingMethodIconUrl,
        shippingAliasName: '',
        shippingParty: 'other'
      })
    }


    console.log('click select', item)

    const arr = this.methodName.split(' ')
    const arr2 = this.methodName.split('&')

    if (this.methodName) {
      if (this.methodName == 'line man') {
        this.shippingForm.patchValue({
          shippingIconUrl: item.shippingMethodIconUrl,
          shippingName: this.methodName.toUpperCase(),
        })

        console.log('methodName', this.shippingForm.get('shippingName').value)
      } else {
        for (let i = 0; i < arr.length; i++) {
          if (arr2.length >= 2) {
            arr[i] = arr[i].toUpperCase()
          } else {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
          }
        }
        const str2 = arr.join(' ')
        console.log('methodName', str2)
        this.shippingForm.patchValue({
          shippingIconUrl: item.shippingMethodIconUrl,
          shippingName: str2,
        })
      }

      if(this.methodName == 'other') {
        console.log('Other select =>', this.methodName)
        this.shippingForm.patchValue({
          shippingName: 'blank',
        })
      }
    }

    // console.log('shippingForm =>', this.shippingForm.value)
    console.log('Shipping Form Real =>', this.shippingFormReal.value)
  }

  addRow(typeCal, length) {
    if (typeCal == 'basedByStepPcs') {
      const indexlast: number = this.groupArrshippingMethodAttribute.length
      const valnumPiece: number =
        +this.groupArrshippingMethodAttribute.at(indexlast - 1).get('minPcs').value + 1

      this.groupArrshippingMethodAttribute.push(
        this.formBuilder.group({
          minPcs: +valnumPiece,
          shippingCost: 0
        })
      )
      this.formgExceedbasedByStepPcs
        .get('minPcs')
        .patchValue(+valnumPiece)


      this.groupArrshippingMethodAttributeSave.push(
        this.formBuilder.group({
          minPcs: +valnumPiece,
          shippingCost: 0
        })
      )     

      console.log('length add', length)

      if(length == 1) {
        this.groupArrshippingMethodAttribute.at(1).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(0).get('minPcs').value) + 1)])     
        this.groupArrshippingMethodAttribute.at(1).get('minPcs').markAsDirty()
        this.groupArrshippingMethodAttribute.at(1).get('minPcs').updateValueAndValidity()       

        this.groupArrshippingMethodAttribute.at(0).get('minPcs').valueChanges.subscribe((res) => {         
          console.log('minPcs Valuechanges', res)

          if(this.groupArrshippingMethodAttribute.length > 1) {
            this.groupArrshippingMethodAttribute.at(1).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(0).get('minPcs').value) + 1)])  
            this.groupArrshippingMethodAttribute.at(1).get('minPcs').markAsDirty()
            this.groupArrshippingMethodAttribute.at(1).get('minPcs').updateValueAndValidity()
          }
          
        })
      }

      if(length > 1) {
        this.groupArrshippingMethodAttribute.at(length).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(length - 1).get('minPcs').value) + 1)])
        this.groupArrshippingMethodAttribute.at(length).get('minPcs').markAsDirty()
        this.groupArrshippingMethodAttribute.at(length).get('minPcs').updateValueAndValidity()   

        this.groupArrshippingMethodAttribute.at(length - 1).get('minPcs').valueChanges.subscribe((res) => {
          console.log('minPcs Valuechanges', res)

          if(this.groupArrshippingMethodAttribute.length > length) {
            this.groupArrshippingMethodAttribute.at(length).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(length - 1).get('minPcs').value) + 1)])    
            this.groupArrshippingMethodAttribute.at(length).get('minPcs').markAsDirty()
            this.groupArrshippingMethodAttribute.at(length).get('minPcs').updateValueAndValidity()
          }       
      
        })
      }
     
    }

    if (typeCal == 'basedByStepWeight') {
      const indexlast: number = this.groupArrshippingMethodAttribute.length
      const valnumKg: number =
        +this.groupArrshippingMethodAttribute.at(indexlast - 1).get('minWeight')
          .value + 1
      this.groupArrshippingMethodAttribute.push(
        this.formBuilder.group({
          minWeight: (+valnumKg),
          shippingCost: 0
        })
      )

      this.formgExceedbasedByStepWeight
        .get('minWeight')
        .patchValue(+valnumKg)

    
      this.groupArrshippingMethodAttributeSave.push(
        this.formBuilder.group({
          minWeight: (+valnumKg),
          shippingCost: 0
        })
      )

      if(length == 1) {
        this.groupArrshippingMethodAttribute.at(1).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minWeight').value) + 0.01).toFixed(2))])     
        this.groupArrshippingMethodAttribute.at(1).get('minWeight').markAsDirty()
        this.groupArrshippingMethodAttribute.at(1).get('minWeight').updateValueAndValidity()       

        this.groupArrshippingMethodAttribute.at(0).get('minWeight').valueChanges.subscribe((res) => {         
          console.log('minPcs Valuechanges', res)

          if(this.groupArrshippingMethodAttribute.length > 1) {
            this.groupArrshippingMethodAttribute.at(1).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minWeight').value) + 0.01).toFixed(2))])  
            this.groupArrshippingMethodAttribute.at(1).get('minWeight').markAsDirty()
            this.groupArrshippingMethodAttribute.at(1).get('minWeight').updateValueAndValidity()
          }
          
        })
      }

      if(length > 1) {

        this.groupArrshippingMethodAttribute.at(length).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(length - 1).get('minWeight').value) + 0.01).toFixed(2))])
        this.groupArrshippingMethodAttribute.at(length).get('minWeight').markAsDirty()
        this.groupArrshippingMethodAttribute.at(length).get('minWeight').updateValueAndValidity()   

        this.groupArrshippingMethodAttribute.at(length - 1).get('minWeight').valueChanges.subscribe((res) => {
          console.log('minPcs Valuechanges', res)

          if(this.groupArrshippingMethodAttribute.length > length) {
            this.groupArrshippingMethodAttribute.at(length).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(length - 1).get('minWeight').value) + 0.01).toFixed(2))])    
            this.groupArrshippingMethodAttribute.at(length).get('minWeight').markAsDirty()
            this.groupArrshippingMethodAttribute.at(length).get('minWeight').updateValueAndValidity()
          }      
      
        })
      }

    }

    if (typeCal == 'basedByOrderPrice') {
      const indexlast: number = this.groupArrshippingMethodAttribute.length
      const valnumAmount: number =
        +this.groupArrshippingMethodAttribute.at(indexlast - 1).get('minOrderTotalAmount')
          .value + 1
      this.groupArrshippingMethodAttribute.push(
        this.formBuilder.group({
          minOrderTotalAmount: +valnumAmount,
          shippingCost: 0
        })
      )

      this.formgExceedbasedByOrderPrice
        .get('minOrderTotalAmount')
        .patchValue(+valnumAmount)

      this.groupArrshippingMethodAttributeSave.push(
        this.formBuilder.group({
          minOrderTotalAmount: +valnumAmount,
          shippingCost: 0
        })
      )

      if(length == 1) {
        this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])     
        this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').markAsDirty()
        this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').updateValueAndValidity()       

        this.groupArrshippingMethodAttribute.at(0).get('minOrderTotalAmount').valueChanges.subscribe((res) => {         
          console.log('minPcs Valuechanges', res)
          
          if(this.groupArrshippingMethodAttribute.length > 1) {
            this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])  
            this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').markAsDirty()
            this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').updateValueAndValidity()
          }
          
        })
      }

      if(length > 1) {
        this.groupArrshippingMethodAttribute.at(length).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(length - 1).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])
        this.groupArrshippingMethodAttribute.at(length).get('minOrderTotalAmount').markAsDirty()
        this.groupArrshippingMethodAttribute.at(length).get('minOrderTotalAmount').updateValueAndValidity()   

        this.groupArrshippingMethodAttribute.at(length - 1).get('minOrderTotalAmount').valueChanges.subscribe((res) => {
          console.log('minPcs Valuechanges', res)

          if(this.groupArrshippingMethodAttribute.length > length) {
            this.groupArrshippingMethodAttribute.at(length).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(length - 1).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])    
            this.groupArrshippingMethodAttribute.at(length).get('minOrderTotalAmount').markAsDirty()
            this.groupArrshippingMethodAttribute.at(length).get('minOrderTotalAmount').updateValueAndValidity()
          }   
      
        })
      }

    }
  }

  deleteGroup(index, typeCal) {
    if (typeCal == 'basedByStepPcs') {
      this.groupArrshippingMethodAttribute.removeAt(index)
      const indexlast = this.groupArrshippingMethodAttribute.length
      const valnumPieceLast = this.groupArrshippingMethodAttribute
        .at(indexlast - 1)
        .get('minPcs').value

      this.formgExceedbasedByStepPcs.get('minPcs').patchValue(+valnumPieceLast)

      this.groupArrshippingMethodAttributeSave.removeAt(index)
    }

    if (typeCal == 'basedByStepWeight') {
      this.groupArrshippingMethodAttribute.removeAt(index)
      const indexlast = this.groupArrshippingMethodAttribute.length
      const valnumKgLast = this.groupArrshippingMethodAttribute
        .at(indexlast - 1)
        .get('minWeight').value

      this.formgExceedbasedByStepWeight.get('minWeight').patchValue(+valnumKgLast)

      this.groupArrshippingMethodAttributeSave.removeAt(index)
    }

    if (typeCal == 'basedByOrderPrice') {
      this.groupArrshippingMethodAttribute.removeAt(index)
      const indexlast = this.groupArrshippingMethodAttribute.length
      const valnumAmountLast = this.groupArrshippingMethodAttribute
        .at(indexlast - 1)
        .get('minOrderTotalAmount').value

      this.formgExceedbasedByOrderPrice.get('minOrderTotalAmount').patchValue(+valnumAmountLast)

      this.groupArrshippingMethodAttributeSave.removeAt(index)
    }
  }

  setExceedChange(typeCal: string) {
    if (typeCal == 'basedByStepPcs') {
      const indexlast = this.groupArrshippingMethodAttribute.length
      const valnumPieceLast = this.groupArrshippingMethodAttribute
        .at(indexlast - 1)
        .get('minPcs').value

      this.formgExceedbasedByStepPcs.get('minPcs').setValue(+valnumPieceLast)
    }

    if (typeCal == 'basedByStepWeight') {
      const indexlast = this.groupArrshippingMethodAttribute.length
      const valnumKgLast = this.groupArrshippingMethodAttribute
        .at(indexlast - 1)
        .get('minWeight').value

      this.formgExceedbasedByStepWeight.get('minWeight').setValue(+valnumKgLast)
    }

    if (typeCal == 'basedByOrderPrice') {
      const indexlast = this.groupArrshippingMethodAttribute.length
      const valnumAmountLast = this.groupArrshippingMethodAttribute
        .at(indexlast - 1)
        .get('minOrderTotalAmount').value

      this.formgExceedbasedByOrderPrice.get('minOrderTotalAmount').setValue(+valnumAmountLast)
    }
  }

  convertNumber(value, form) {
    console.log('convertNumber change', value)

    let number = value ? value : 0

    if (typeof value === 'string') {
      number = parseFloat(value.split(',').join(''))
    }

    this.shippingFormReal.get(form).patchValue(+number ? (+number) : 0)
  }

  convertNumberShipfree(typeShip, value, form) {
    console.log('convertNumberShipfree change', value)

    let number = value ? value : 0

    if (typeof value === 'string') {
      number = parseFloat(value.split(',').join(''))
    }

    if(value == 0 || value == '') {
      this[typeShip].patchValue(false)
      this.shippingFormReal.get(form).setValue(+0)
    } else {
      this.shippingFormReal.get(form).patchValue(+number ? (+number) : 0)
    }
  }

  convertNumberExceed(value, formg, formcontrol) {

    let number = value ? value : 0

    if (typeof value === 'string') {
      number = parseFloat(value.split(',').join(''))
    }

    if(formg == 'formgExceedbasedByStepPcs') {
      this.formgExceedbasedByStepPcs.get(formcontrol).setValue(+number ? (+number) : 0)
      console.log(`${formg}`, this[formg].value)
    } else if(formg == 'formgExceedbasedByStepWeight') {
      this.formgExceedbasedByStepWeight.get(formcontrol).setValue(+number ? (+number) : 0)
      console.log(`${formg}`, this[formg].value)
    } else if(formg == 'formgExceedbasedByOrderPrice') {
      this.formgExceedbasedByOrderPrice.get(formcontrol).setValue(+number ? (+number) : 0)
      console.log(`${formg}`, this[formg].value)
    }
  }

  convertArrNumber(value, typeCal, form, index) {

    let number = value ? value : 0

    if (typeof value === 'string') {
      number = parseFloat(value.split(',').join(''))
    }
    
    if (typeCal == 'basedByStepPcs') {
      this.groupArrshippingMethodAttribute
        .at(index)
        .get(form)
        .setValue(+number ? (+number) : 0)

      if(this.params !== 'new') {

        this.groupArrshippingMethodAttribute.controls.forEach((el, index) => {
          if(index == 1) {
            this.groupArrshippingMethodAttribute.at(1).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(0).get('minPcs').value) + 1)])     
            this.groupArrshippingMethodAttribute.at(1).get('minPcs').markAsDirty()
            this.groupArrshippingMethodAttribute.at(1).get('minPcs').updateValueAndValidity()       
      
            this.groupArrshippingMethodAttribute.at(0).get('minPcs').valueChanges.subscribe((res) => {         
              console.log('minPcs Valuechanges', res)
      
              if(this.groupArrshippingMethodAttribute.length > 1) {
                this.groupArrshippingMethodAttribute.at(1).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(0).get('minPcs').value) + 1)])  
                this.groupArrshippingMethodAttribute.at(1).get('minPcs').markAsDirty()
                this.groupArrshippingMethodAttribute.at(1).get('minPcs').updateValueAndValidity()
              }        
            })
          }
      
          if(index > 1) {
            this.groupArrshippingMethodAttribute.at(index).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(index - 1).get('minPcs').value) + 1)])
            this.groupArrshippingMethodAttribute.at(index).get('minPcs').markAsDirty()
            this.groupArrshippingMethodAttribute.at(index).get('minPcs').updateValueAndValidity()   
      
            this.groupArrshippingMethodAttribute.at(index - 1).get('minPcs').valueChanges.subscribe((res) => {
              console.log('minPcs Valuechanges', res)
      
              if(this.groupArrshippingMethodAttribute.length > index) {
                this.groupArrshippingMethodAttribute.at(index).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(index - 1).get('minPcs').value) + 1)])    
                this.groupArrshippingMethodAttribute.at(index).get('minPcs').markAsDirty()
                this.groupArrshippingMethodAttribute.at(index).get('minPcs').updateValueAndValidity()
              }       
            })
          }
        })
   
  
      }
    }

    if (typeCal == 'basedByStepWeight') {
      this.groupArrshippingMethodAttribute
        .at(index)
        .get(form)
        .setValue(+number ? (+number) : 0)

      if(this.params !== 'new') {
        this.groupArrshippingMethodAttribute.controls.forEach((el, index) => {
          if(index == 1) {
            this.groupArrshippingMethodAttribute.at(1).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minWeight').value) + 0.01).toFixed(2))])     
            this.groupArrshippingMethodAttribute.at(1).get('minWeight').markAsDirty()
            this.groupArrshippingMethodAttribute.at(1).get('minWeight').updateValueAndValidity()       
    
            this.groupArrshippingMethodAttribute.at(0).get('minWeight').valueChanges.subscribe((res) => {         
              console.log('minPcs Valuechanges', res)
    
              if(this.groupArrshippingMethodAttribute.length > 1) {
                this.groupArrshippingMethodAttribute.at(1).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minWeight').value) + 0.01).toFixed(2))])  
                this.groupArrshippingMethodAttribute.at(1).get('minWeight').markAsDirty()
                this.groupArrshippingMethodAttribute.at(1).get('minWeight').updateValueAndValidity()
              }
              
            })
          }
    
          if(index > 1) {
            this.groupArrshippingMethodAttribute.at(index).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(index - 1).get('minWeight').value) + 0.01).toFixed(2))])
            this.groupArrshippingMethodAttribute.at(index).get('minWeight').markAsDirty()
            this.groupArrshippingMethodAttribute.at(index).get('minWeight').updateValueAndValidity()   
    
            this.groupArrshippingMethodAttribute.at(index - 1).get('minWeight').valueChanges.subscribe((res) => {
              console.log('minPcs Valuechanges', res)
    
              if(this.groupArrshippingMethodAttribute.length > index) {
                this.groupArrshippingMethodAttribute.at(index).get('minWeight').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(index - 1).get('minWeight').value) + 0.01).toFixed(2))])    
                this.groupArrshippingMethodAttribute.at(index).get('minWeight').markAsDirty()
                this.groupArrshippingMethodAttribute.at(index).get('minWeight').updateValueAndValidity()
              }      
          
            })
          }

        })
      }
       
    }

    if (typeCal == 'basedByOrderPrice') {
      this.groupArrshippingMethodAttribute
        .at(index)
        .get(form)
        .setValue(+number ? (+number) : 0)

      if(this.params !== 'new') {
        this.groupArrshippingMethodAttribute.controls.forEach((el, index) => {
          if(index == 1) {
            this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])     
            this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').markAsDirty()
            this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').updateValueAndValidity()       
    
            this.groupArrshippingMethodAttribute.at(0).get('minOrderTotalAmount').valueChanges.subscribe((res) => {         
              console.log('minPcs Valuechanges', res)
              
              if(this.groupArrshippingMethodAttribute.length > 1) {
                this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(0).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])  
                this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').markAsDirty()
                this.groupArrshippingMethodAttribute.at(1).get('minOrderTotalAmount').updateValueAndValidity()
              }
              
            })
          }
    
          if(index > 1) {
            this.groupArrshippingMethodAttribute.at(index).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(index - 1).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])
            this.groupArrshippingMethodAttribute.at(index).get('minOrderTotalAmount').markAsDirty()
            this.groupArrshippingMethodAttribute.at(index).get('minOrderTotalAmount').updateValueAndValidity()   
    
            this.groupArrshippingMethodAttribute.at(index - 1).get('minOrderTotalAmount').valueChanges.subscribe((res) => {
              console.log('minPcs Valuechanges', res)
    
              if(this.groupArrshippingMethodAttribute.length > index) {
                this.groupArrshippingMethodAttribute.at(index).get('minOrderTotalAmount').setValidators([Validators.min(+((+this.groupArrshippingMethodAttribute.at(index - 1).get('minOrderTotalAmount').value) + 0.01).toFixed(2))])    
                this.groupArrshippingMethodAttribute.at(index).get('minOrderTotalAmount').markAsDirty()
                this.groupArrshippingMethodAttribute.at(index).get('minOrderTotalAmount').updateValueAndValidity()
              }   
          
            })
          }

        })
      }
    }


    // if(index > 0 && index < 2) {
    //   this.groupArrshippingMethodAttribute.at(1).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(0).get('minPcs').value) + 1)])     
    //   this.groupArrshippingMethodAttribute.at(1).get('minPcs').updateValueAndValidity()
    // }

    // if(index > 1) {
    //   this.groupArrshippingMethodAttribute.at(index).get('minPcs').setValidators([Validators.min((+this.groupArrshippingMethodAttribute.at(index - 1).get('minPcs').value) + 1)])
    //   this.groupArrshippingMethodAttribute.at(index).get('minPcs').updateValueAndValidity()
    // }
    
  }

  onUpdateShipfree(type: string, cbType: string) {
    console.log('cbShipmentfree', this[cbType].value)

    if(this[cbType].value == true) {
      this.shippingFormReal.get(type).patchValue(+1)
    } else {
      this.shippingFormReal.get(type).patchValue(+0)
    }
    
  }

  submit() {
    this.clicked = true
    let dataForm: GappSetting.CreateShippingMethod = this.shippingFormReal.getRawValue()
    
    this.shippingFormRealSave.patchValue(dataForm)
    console.log('shippingFormRealSave =>', this.shippingFormRealSave.getRawValue())

    let dataFormSave: GappSetting.CreateShippingMethod = this.shippingFormRealSave.getRawValue()

    // if(dataForm.shippingMethodType == 'basedByStepPcs') {
    //   this.groupArrshippingMethodAttribute.push(this.formgExceedbasedByStepPcs)
    //   dataForm = this.shippingFormReal.getRawValue()
    //   console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttribute.value)
    // } else if(dataForm.shippingMethodType == 'basedByStepWeight') {
    //   this.groupArrshippingMethodAttribute.push(this.formgExceedbasedByStepWeight)
    //   dataForm = this.shippingFormReal.getRawValue()
    //   console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttribute.value)
    // } else if(dataForm.shippingMethodType == 'basedByOrderPrice') {
    //   this.groupArrshippingMethodAttribute.push(this.formgExceedbasedByOrderPrice)
    //   dataForm = this.shippingFormReal.getRawValue()
    //   console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttribute.value)
    // }

    //formRealsave
    if(dataFormSave.shippingMethodType == 'basedByStepPcs') {
      this.groupArrshippingMethodAttributeSave.push(this.formgExceedbasedByStepPcs)
      dataFormSave = this.shippingFormRealSave.getRawValue()
      console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttributeSave.value)
    } else if(dataFormSave.shippingMethodType == 'basedByStepWeight') {
      this.groupArrshippingMethodAttributeSave.push(this.formgExceedbasedByStepWeight)
      dataFormSave = this.shippingFormRealSave.getRawValue()
      console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttributeSave.value)
    } else if(dataFormSave.shippingMethodType == 'basedByOrderPrice') {
      this.groupArrshippingMethodAttributeSave.push(this.formgExceedbasedByOrderPrice)
      dataFormSave = this.shippingFormRealSave.getRawValue()
      console.log('groupArrshippingMethodAttribute', this.groupArrshippingMethodAttributeSave.value)
    }

    console.log('[POST] shippingform ---> ', dataForm)
    console.log('[POST] shippingformSave ---> ', dataFormSave)

    if (this.shippingFormReal.valid) {
      this.companyService.createShippingChannelReal(dataFormSave).subscribe(
        (next) => console.log(next),
        (error) => console.log(error),
        () => {
          this.router.navigateByUrl('/app/setting/shipping-channels')
        }
      )
    }

  }
}
