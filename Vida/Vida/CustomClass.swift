//
//  CustomClass.swift
//  Vida
//
//  Created by Ryoya Ogishima on 11/12/16.
//  Copyright © 2016 YHack16. All rights reserved.
//

import Foundation
import UIKit

@IBDesignable class CustomButton: UIButton {
    
    // radius (when 0, rectangular)
    @IBInspectable var cornerRadius: CGFloat = 0.0
    
    // frame
    @IBInspectable var borderColor: UIColor = UIColor.clear
    @IBInspectable var borderWidth: CGFloat = 0.0
    
    override func draw(_ rect: CGRect) {
        // circle
        self.layer.cornerRadius = cornerRadius
        self.clipsToBounds = (cornerRadius > 0)
        
        // rectangular
        self.layer.borderColor = borderColor.cgColor
        self.layer.borderWidth = borderWidth
        
        super.draw(rect)
    }
}
